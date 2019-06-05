import * as ipp from "ipp";
import * as PDFDocument from "pdfkit";

const doc = new PDFDocument();
doc.text("Hello World");

const buffers = [];
doc.on("data", buffers.push.bind(buffers));
doc.on("end", () => {
  const printer = ipp.Printer("http://192.168.1.93:631/ipp/printer");
  const msg = {
    "data": Buffer.concat(buffers),
    "operation-attributes-tag": {
      "document-format": "application/pdf",
      "job-name": "My Test Job",
      "requesting-user-name": "William",
    },
  };

  ipp.request("http://192.168.1.93:631", {
    "operation": "Get-Printer-Attributes",
    "operation-attributes-tag": {
      "attributes-charset": "utf-8",
      "attributes-natural-language": "en",
      "printer-uri": "http://192.168.1.93:631",
    },
  }, (err, res) => {
    if (err) {
      return process.stdout.write(err + "\n");
    }
    process.stdout.write(JSON.stringify(res, null, 2) + "\n");
  });

  printer.execute("Print-Job", msg, (err, res) => {
    process.stdout.write(res + "\n");
  });
});
doc.end();
