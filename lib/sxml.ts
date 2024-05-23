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
  const writeArray = (obj: Array<any>, indent = 0) => {
    for (let i = 0; i < obj.length; i++) {
      const value = obj[i];
      writeObj(value, indent + 1);
    }
  };
  const writeOutValue = (value: any) => {
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
      writeStartTag(key);
      const value = obj[key];
      const type = getType(value);
      if (type == "object") {
        writeObj(value, indent + 1);
      } else if (type == "simple") {
        writeOutValue(value);
      } else if (type == "array") {
        writeArray(value, indent);
      } else {
      }
      writeEndTag(key);
    }
  };
  const build = () => {
    writeObj(body, 1);
    return output.join("");
  };
  return build();
}
