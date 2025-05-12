/** @fileoverview Common functions used by multiple parts of the build process */

import type { WcagItem } from "./guidelines";

/** Generates an ID for heading permalinks. Equivalent to wcag:generate-id in base.xslt. */
export function generateId(title: string) {
  if (title === "Parsing (Obsolete and removed)") return "parsing";
  return title
    .replace(/\s+/g, "-")
    .replace(/[,\():]+/g, "")
    .toLowerCase();
}

/** Given a string "xy", returns "x.y" */
export const resolveDecimalVersion = (version: `${number}`) => version.split("").join(".");

/** Sort function for ordering WCAG principle/guideline/SC numbers ascending */
export function wcagSort(a: WcagItem, b: WcagItem) {
  const aParts = a.num.split(".").map((n) => +n);
  const bParts = b.num.split(".").map((n) => +n);

  for (let i = 0; i < 3; i++) {
    if (aParts[i] > bParts[i] || (aParts[i] && !bParts[i])) return 1;
    if (aParts[i] < bParts[i] || (bParts[i] && !aParts[i])) return -1;
  }
  return 0;
}

async function fetchAndExpect2xx(url: string | URL, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status >= 400) throw new Error(`Status ${response.status} received from ${url}`);
  return response;
}

export const fetchText = async (url: string | URL, init?: RequestInit) =>
  fetchAndExpect2xx(url, init).then((response) => response.text());

interface FetchJsonOptions {
  defaultResponse?: any;
}

export const fetchJson = async (
  url: string | URL,
  init?: RequestInit,
  options: FetchJsonOptions = {}
) => {
  function handleError(message: string) {
    if (process.env.ELEVENTY_RUN_MODE !== "build" && "defaultResponse" in options) {
      console.warn(`Fetch error: ${message}`);
      return options.defaultResponse;
    } else throw new Error(message);
  }

  try {
    return (await fetchAndExpect2xx(url, init)).json();
  } catch (error) {
    return handleError(error.message);
  }
};
