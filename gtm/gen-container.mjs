// Gera o export de container GTM (exportFormatVersion 2) da LP Gaspar Lopes.
// Uso: node gtm/gen-container.mjs gtm/gtm-container-gaspar-lopes.json
// Não editar o JSON à mão: alterar aqui e regenerar.
import { writeFileSync } from "node:fs";

const OUT = process.argv[2] ?? "gtm/gtm-container-gaspar-lopes.json";
const ACCOUNT = "0";
const CONTAINER = "0";
const SITE_HOST = "PREENCHER-DOMINIO.com.br"; // [PREENCHER] domínio real (exclui cliques internos do "outbound")

let tagSeq = 0, trgSeq = 0, varSeq = 0;
const tags = [], triggers = [], variables = [];
const trgId = {};
const T = (k, v) => ({ type: "TEMPLATE", key: k, value: v });
const B = (k, v) => ({ type: "BOOLEAN", key: k, value: String(v) });

function variable(name, type, parameter) {
  variables.push({ accountId: ACCOUNT, containerId: CONTAINER, variableId: String(++varSeq), name, type, parameter });
}
function constant(name, value) { variable(name, "c", [T("value", value)]); }
function dlv(key) {
  variable(`DLV - ${key}`, "v", [B("setDefaultValue", false), T("name", key), T("dataLayerVersion", "2")]);
}
function trigger(name, type, extra = {}) {
  const id = String(++trgSeq);
  trgId[name] = id;
  triggers.push({ accountId: ACCOUNT, containerId: CONTAINER, triggerId: id, name, type, ...extra });
  return id;
}
function ceTrigger(event) {
  return trigger(`CE - ${event}`, "CUSTOM_EVENT", {
    customEventFilter: [{ type: "EQUALS", parameter: [T("arg0", "{{_event}}"), T("arg1", event)] }],
  });
}
function tag(name, type, parameter, firing, extra = {}) {
  tags.push({
    accountId: ACCOUNT, containerId: CONTAINER, tagId: String(++tagSeq), name, type, parameter,
    firingTriggerId: firing.map((n) => trgId[n]),
    tagFiringOption: "ONCE_PER_EVENT",
    monitoringMetadata: { type: "MAP" },
    consentSettings: { consentStatus: "NOT_SET" },
    ...extra,
  });
}
const eventTable = (pairs) => ({
  type: "LIST", key: "eventSettingsTable",
  list: pairs.map(([p, v]) => ({ type: "MAP", map: [T("parameter", p), T("parameterValue", v)] })),
});
function ga4Event(eventName, triggerName, pairs, tagName) {
  tag(tagName ?? `GA4 - ${eventName}`, "gaawe", [
    B("sendEcommerceData", false),
    T("eventName", eventName),
    eventTable(pairs),
    T("measurementIdOverride", "{{CONST - GA4 Measurement ID}}"),
  ], [triggerName]);
}
function adsConversion(name, labelVar, triggerName) {
  tag(name, "awct", [
    B("enableConversionLinker", true),
    B("enableProductReporting", false),
    B("enableNewCustomerReporting", false),
    B("enableEnhancedConversion", false),
    T("conversionCookiePrefix", "_gcl"),
    T("conversionId", "{{CONST - Google Ads Conversion ID}}"),
    T("conversionLabel", `{{${labelVar}}}`),
  ], [triggerName]);
}

// ---------- Variáveis ----------
// [PREENCHER] após importar: Variáveis → Variáveis definidas pelo usuário → CONST - *
constant("CONST - GA4 Measurement ID", "PREENCHER G-XXXXXXXXXX");
constant("CONST - Google Ads Conversion ID", "PREENCHER só os números do AW-");
constant("CONST - Ads Label - whatsapp_click", "PREENCHER rótulo da conversão WhatsApp");
["source", "label", "page", "network", "filter", "question", "section", "consent_choice"].forEach(dlv);

// ---------- Gatilhos ----------
trigger("Initialization - All Pages", "INIT");
trigger("All Pages", "PAGEVIEW");
const CUSTOM_EVENTS = [
  "whatsapp_click", "social_click", "collection_filter", "faq_open", "section_view", "cookie_consent",
];
CUSTOM_EVENTS.forEach(ceTrigger);
trigger("Scroll - 25/50/75/90", "SCROLL_DEPTH", {
  parameter: [
    B("verticalThresholdOn", true), T("verticalThresholdUnits", "PERCENT"),
    T("verticalThresholdsPercent", "25,50,75,90"), B("horizontalThresholdOn", false),
    T("triggerStartOption", "WINDOW_LOAD"),
  ],
});
trigger("Click - Outbound link", "LINK_CLICK", {
  waitForTags: { type: "BOOLEAN", value: "false" },
  checkValidation: { type: "BOOLEAN", value: "true" },
  waitForTagsTimeout: { type: "TEMPLATE", value: "2000" },
  uniqueTriggerId: { type: "TEMPLATE" },
  autoEventFilter: [{ type: "MATCH_REGEX", parameter: [T("arg0", "{{Page URL}}"), T("arg1", ".*")] }],
  filter: [
    { type: "STARTS_WITH", parameter: [T("arg0", "{{Click URL}}"), T("arg1", "http")] },
    { type: "CONTAINS", parameter: [T("arg0", "{{Click URL}}"), T("arg1", SITE_HOST)], negate: true },
    { type: "CONTAINS", parameter: [T("arg0", "{{Click URL}}"), T("arg1", "wa.me")], negate: true },
    { type: "CONTAINS", parameter: [T("arg0", "{{Click URL}}"), T("arg1", "instagram.com")], negate: true },
  ],
});

// ---------- Tags: GA4 ----------
// Google Tag com page_view automático (LP estática, sem navegação SPA).
tag("Google Tag - GA4", "googtag", [
  T("tagId", "{{CONST - GA4 Measurement ID}}"),
], ["Initialization - All Pages"]);

ga4Event("whatsapp_click", "CE - whatsapp_click", [
  ["source", "{{DLV - source}}"], ["label", "{{DLV - label}}"], ["page", "{{DLV - page}}"],
]);
ga4Event("social_click", "CE - social_click", [
  ["network", "{{DLV - network}}"], ["source", "{{DLV - source}}"], ["page", "{{DLV - page}}"],
]);
ga4Event("collection_filter", "CE - collection_filter", [["filter", "{{DLV - filter}}"]]);
ga4Event("faq_open", "CE - faq_open", [["question", "{{DLV - question}}"]]);
ga4Event("section_view", "CE - section_view", [["section", "{{DLV - section}}"]]);
ga4Event("cookie_consent", "CE - cookie_consent", [["consent_choice", "{{DLV - consent_choice}}"]]);
ga4Event("scroll_depth", "Scroll - 25/50/75/90", [["percent_scrolled", "{{Scroll Depth Threshold}}"], ["page_path", "{{Page Path}}"]]);
ga4Event("click_outbound", "Click - Outbound link", [["link_url", "{{Click URL}}"], ["link_text", "{{Click Text}}"], ["page_path", "{{Page Path}}"]]);

// ---------- Tags: Google Ads ----------
tag("Ads - Conversion Linker", "gclidw", [
  B("enableCrossDomain", false), B("enableUrlPassthrough", false), B("enableCookieOverrides", false),
], ["Initialization - All Pages"]);
tag("Ads - Remarketing", "sp", [
  B("enableConversionLinker", true), B("enableDynamicRemarketing", false),
  T("conversionId", "{{CONST - Google Ads Conversion ID}}"), T("customParamsFormat", "NONE"),
], ["All Pages"]);
adsConversion("Ads - Conversão - WhatsApp Click (principal)", "CONST - Ads Label - whatsapp_click", "CE - whatsapp_click");

const out = {
  exportFormatVersion: 2,
  exportTime: "2026-09-01 00:00:00",
  containerVersion: {
    path: `accounts/${ACCOUNT}/containers/${CONTAINER}/versions/0`,
    accountId: ACCOUNT,
    containerId: CONTAINER,
    containerVersionId: "0",
    name: "Gaspar Lopes LP, GA4 + Google Ads",
    description: "Container gerado para a landing page Gaspar Lopes Alfaiataria. Preencher as 3 variáveis CONST - * após importar (ver gtm/TRACKING.md).",
    container: {
      accountId: ACCOUNT, containerId: CONTAINER, name: "LP Gaspar Lopes",
      usageContext: ["WEB"],
    },
    tag: tags,
    trigger: triggers,
    variable: variables,
    builtInVariable: [
      { accountId: ACCOUNT, containerId: CONTAINER, type: "PAGE_URL", name: "Page URL" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "PAGE_HOSTNAME", name: "Page Hostname" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "PAGE_PATH", name: "Page Path" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "REFERRER", name: "Referrer" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "EVENT", name: "Event" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "CLICK_URL", name: "Click URL" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "CLICK_TEXT", name: "Click Text" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "CLICK_CLASSES", name: "Click Classes" },
      { accountId: ACCOUNT, containerId: CONTAINER, type: "SCROLL_DEPTH_THRESHOLD", name: "Scroll Depth Threshold" },
    ],
  },
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`tags=${tags.length} triggers=${triggers.length} variables=${variables.length} -> ${OUT}`);
