const elementoExibidor = document.getElementById('elementoExibidor');
const elFileName = document.getElementById('fileName');

document.getElementById('seletorArquivo').addEventListener('change', async(e) => {
    const file = e.target.files[0];
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;

    for (let p = 1; p <= pdf.numPages; p++){
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({scale: 2});
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport
        }).promise;

        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );

        if(code){
            if(elementoExibidor.classList.contains('hidden')){
                elementoExibidor.classList.remove('hidden');
            };

            elementoExibidor.href = `https:\\${code.data}`;
            elementoExibidor.textContent = code.data

            elFileName.textContent = `Arquivo carregado: ${file.name}`;

            document.querySelector('form').reset();
        };

    };
});
