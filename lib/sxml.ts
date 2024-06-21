function escapeHTML(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;")
    .replace(/~/g, "&#126;");
}
export default function builder_xml(
  body: any,
  opts: { header: boolean },
): string {
  const output: any[] = [];
  if (opts.header) {
    output.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`);
  }
  const getType = (value: any) => {
    if (typeof value === "string" || typeof value === "number") {
      return "simple";
    }
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && value != null) return "object";
    return "unknown";
  };
  const writeArray = (
    obj: Array<any>,
    indent = 0,
    parentK: string | null = null,
  ) => {
    for (let i = 0; i < obj.length; i++) {
      const value = obj[i];
      if (parentK) writeStartTag(parentK);
      writeObj(value, indent + 1);
      if (parentK) writeEndTag(parentK);
    }
  };
  const writeOutValue = (value: any) => {
    if (typeof value == "string") value = escapeHTML(value);
    output.push(`${value}`);
  };
  const writeStartTag = (tag: string) => {
    output.push(`<${tag}>`);
  };
  const writeEndTag = (tag: string) => {
    output.push(`</${tag}>`);
  };
  const writeObj = (obj: any, indent = 0) => {
    const type = getType(obj);
    if (type == "object") {
    } else if (type == "simple") {
      return writeOutValue(obj);
    } else {
      return;
    }
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = obj[key];
      const type = getType(value);
      if (type == "object") {
        writeStartTag(key);
        writeObj(value, indent + 1);
        writeEndTag(key);
      } else if (type == "simple") {
        writeStartTag(key);
        writeOutValue(value);
        writeEndTag(key);
      } else if (type == "array") {
        const parentKeys = Object.keys(obj);
        if(parentKeys.length != 1) writeStartTag(key);
        writeArray(
          value,
          indent,
          parentKeys.length == 1 ? parentKeys[0] : null,
        );
        if(parentKeys.length != 1) writeEndTag(key);
      } else {
        writeStartTag(key);
        writeEndTag(key);
      }
    }
  };
  const build = () => {
    writeObj(body, 1);
    console.log(output.join(""));
    process.exit(0);
    return output.join("");
  };
  return build();
}
