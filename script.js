const elementoExibidor = document.getElementById("elementoExibidor");
const elFileName = document.getElementById("fileName");
const seletorArquivo = document.getElementById("seletorArquivo");

async function processPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();

  elFileName.textContent = "";
  elementoExibidor.textContent = "....";

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  if(!pdf){
    console.error("Erro ao carregar o PDF: ", file.name);
    alert("Erro ao carregar o PDF: " + file.name);
    return;
  }

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    try {
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    } catch (e) {
      console.error("Erro ao renderizar a página: ", e);
      alert("Erro ao renderizar a página: " + e);
      continue;
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      const url = code.data;
      if (url.startsWith("http:\\")) {
        elementoExibidor.href = url;
      } else {
        elementoExibidor.href = `https:\\${url}`;
      }
      elementoExibidor.textContent = url;
      elFileName.textContent = `Arquivo carregado: ${file.name}`;
      document.querySelector("form").reset();
      return; // stop after first found
    } else {
      elFileName.textContent = `Erro ao carregar o arquivo ${file.name}, pode ser que ele não possua um QRCode.`;
      document.querySelector("form").reset();
    }
  }
}

seletorArquivo.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) await processPdfFile(file);
});

// expose for reuse
window.processPdfFile = processPdfFile;
