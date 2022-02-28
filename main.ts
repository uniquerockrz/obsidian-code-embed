import { loadPrism, Plugin, TFile } from 'obsidian';

export default class CodeEmbedPlugin extends Plugin {
	async onload(){
		console.log('Started Plugin Load');

		this.registerMarkdownCodeBlockProcessor("code-embed", async (src, element, context) => {
			let prismjs = await loadPrism();

			const fileDataCache = (this.app.metadataCache as any).uniqueFileLookup.data;
			
			let fileToGet = new RegExp(/!\[\[(.*?)\]\]/, "g").exec(src)[1];
			console.log(fileToGet)
			
			let fileObj;
			let fileContent;
			let language;

			// check if fileToGet is a full path
			if (fileToGet.split('/').length > 1){
				// get the file name
				let fileName = fileToGet.split('/')[ fileToGet.split('/').length - 1];

				let fileArr = fileDataCache[fileName];
				console.log(fileArr);

				for (let i = 0; i < fileArr.length; i++){
					if (fileArr[i].path == fileToGet){
						fileObj = fileArr[i];
					}
				}
			}
			else{
				if(fileToGet in fileDataCache){
					fileObj = fileDataCache[fileToGet][0];
				}
			}

			if(fileObj){
				try {
					fileContent = await this.app.vault.read(fileObj);
					console.log(fileContent);
					language = fileObj.name.split('.')[fileObj.name.split('.').length - 1];

					let elToReturn = document.createElement("pre");
					elToReturn.addClass("language-" + language);
					let codeDiv = document.createElement("code")
					codeDiv.addClass("language-" + language);
					codeDiv.textContent = fileContent;
					prismjs.highlightElement(codeDiv);
					elToReturn.appendChild(codeDiv);

					element.replaceWith(elToReturn);
				}
				catch (err){
					console.log(err);
					let elToReturn = document.createElement("pre");
					elToReturn.innerText = 'Something went wrong :(';

					element.replaceWith(elToReturn);
				}
			}
			else{
				let elToReturn = document.createElement("pre");
				elToReturn.innerText = 'Error getting that file. Please check the path.';

				element.replaceWith(elToReturn);
			}
		});
	}
}