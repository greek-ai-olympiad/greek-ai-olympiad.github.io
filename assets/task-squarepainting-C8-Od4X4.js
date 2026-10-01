import{m as k,h as t}from"./index-CSsh16TP.js";import{c as J,r as K}from"./task-squarepainting-requiredFiles-BN7a75gy.js";import{useTaskTranslations as Q}from"./useTaskTranslations-eY1SELDD.js";import"./firebase-Bp6MndCM.js";const n=100,ee=100,V=12,C=20,te=g=>new Promise((a,s)=>{const e=new Image;e.crossOrigin="anonymous",e.onload=()=>{try{const d=document.createElement("canvas"),i=d.getContext("2d");d.width=n,d.height=n,i.drawImage(e,0,0,n,n);const f=i.getImageData(0,0,n,n);a(f)}catch(d){s(d)}},e.onerror=s,e.src=g}),O=g=>{const a=new ImageData(n,n),s=a.data;for(let e=0;e<n;e++)for(let d=0;d<n;d++){const i=d/(n-1),f=1-e/(n-1);let[p,y,m]=g(i,f);const D=(e*n+d)*4;s[D]=Math.round(p*255),s[D+1]=Math.round(y*255),s[D+2]=Math.round(m*255),s[D+3]=255}return a},X={basic:{name:"Basic",targetImage:O((g,a)=>[g,a,0])},easy:{name:"Easy",targetImage:O((g,a)=>[0,0,Math.abs(g+a-1)])},medium:{name:"Medium",targetImage:O((g,a)=>[Math.sin(g*15)*.5+.5,Math.cos(a*15)*.5+.5,0])},advanced:{name:"Advanced",targetImage:null,imageSrc:K},hard:{name:"Hard",targetImage:null,imageSrc:J}};class Y{constructor(a=null){this.worker=null,this.onUpdate=null,this.computationId=0,this.images={},this.layers=a||this.generateRandomWeights(),this.setupWorker()}setupWorker(){try{const a=`
                // Matrix multiplication using Float32Array for efficiency
                function matrixMultiply(A, B, result) {
                    const rowsA = A.length;
                    const colsA = A[0].length;
                    const colsB = B[0].length;
                    
                    for (let i = 0; i < rowsA; i++) {
                        for (let j = 0; j < colsB; j++) {
                            let sum = 0;
                            for (let k = 0; k < colsA; k++) {
                                sum += A[i][k] * B[k][j];
                            }
                            result[i][j] = sum;
                        }
                    }
                }

                // Apply ReLU activation
                function applyReLU(matrix) {
                    for (let i = 0; i < matrix.length; i++) {
                        for (let j = 0; j < matrix[i].length; j++) {
                            matrix[i][j] = Math.max(0, matrix[i][j]);
                        }
                    }
                }

                // Add bias to matrix
                function addBias(matrix, bias) {
                    for (let i = 0; i < matrix.length; i++) {
                        for (let j = 0; j < matrix[i].length; j++) {
                            matrix[i][j] += bias[j];
                        }
                    }
                }

                let currentComputationId = null;
                
                self.onmessage = function(e) {
                    const { type, data, computationId } = e.data;
                    
                    if (type === 'COMPUTE_ALL_IMAGES') {
                        // Cancel previous computation if it exists
                        currentComputationId = computationId;
                        const { layers, imageSize } = data;
                        
                        // Generate input coordinates for all pixels
                        const totalPixels = imageSize * imageSize;
                        const inputs = new Array(totalPixels);
                        for (let y = 0; y < imageSize; y++) {
                            for (let x = 0; x < imageSize; x++) {
                                const pixelIndex = y * imageSize + x;
                                inputs[pixelIndex] = [
                                    x / (imageSize - 1),
                                    1 - (y / (imageSize - 1))
                                ];
                            }
                        }

                        // Convert to matrix format for batch processing
                        const inputMatrix = inputs.map(input => [input[0], input[1]]);
                        
                        // Forward pass through all layers
                        let currentInput = inputMatrix;
                        const allActivations = [currentInput];
                        
                        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                            // Check if computation was cancelled
                            if (currentComputationId !== computationId) {
                                return; // Cancel this computation
                            }
                            const layer = layers[layerIndex];
                            const output = new Array(totalPixels);
                            
                            // Matrix multiplication: output = weights * input + bias
                            for (let i = 0; i < totalPixels; i++) {
                                output[i] = new Array(layer.weights.length);
                                for (let j = 0; j < layer.weights.length; j++) {
                                    let sum = layer.bias[j];
                                    for (let k = 0; k < currentInput[i].length; k++) {
                                        sum += layer.weights[j][k] * currentInput[i][k];
                                    }
                                    output[i][j] = sum;
                                }
                            }
                            
                            // Apply ReLU activation (except for output layer)
                            if (layerIndex < layers.length - 1) {
                                applyReLU(output);
                            }
                            
                            
                            currentInput = output;
                            allActivations.push(output.map(row => [...row]));
                        }
                        
                        // Generate image data for each layer and neuron
                        const results = {};
                        
                        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                            // Check if computation was cancelled
                            if (currentComputationId !== computationId) {
                                return; // Cancel this computation
                            }
                            const layerActivations = allActivations[layerIndex + 1];
                            const layerResults = {};
                            
                            // Generate image for each neuron in this layer
                            for (let neuronIndex = 0; neuronIndex < layers[layerIndex].weights.length; neuronIndex++) {
                                // Check if computation was cancelled
                                if (currentComputationId !== computationId) {
                                    return; // Cancel this computation
                                }
                                const imageData = new ImageData(imageSize, imageSize);
                                const pixels = imageData.data;
                                
                                for (let y = 0; y < imageSize; y++) {
                                    for (let x = 0; x < imageSize; x++) {
                                        const pixelIndex = y * imageSize + x;
                                        const value = layerActivations[pixelIndex][neuronIndex];
                                        
                                        // Map value directly to grayscale: 0 = black, 1 = white
                                        const grayscaleValue = Math.max(0, Math.min(255, Math.round(value * 255)));
                                        
                                        const pixelDataIndex = pixelIndex * 4;
                                        
                                        // Color coding for output layer
                                        if (layerIndex === layers.length - 1) {
                                            if (neuronIndex === 0) {
                                                // Red channel
                                                pixels[pixelDataIndex] = grayscaleValue;
                                                pixels[pixelDataIndex + 1] = 0;
                                                pixels[pixelDataIndex + 2] = 0;
                                            } else if (neuronIndex === 1) {
                                                // Green channel
                                                pixels[pixelDataIndex] = 0;
                                                pixels[pixelDataIndex + 1] = grayscaleValue;
                                                pixels[pixelDataIndex + 2] = 0;
                                            } else if (neuronIndex === 2) {
                                                // Blue channel
                                                pixels[pixelDataIndex] = 0;
                                                pixels[pixelDataIndex + 1] = 0;
                                                pixels[pixelDataIndex + 2] = grayscaleValue;
                                            } else {
                                                // Other neurons in output layer
                                                pixels[pixelDataIndex] = grayscaleValue;
                                                pixels[pixelDataIndex + 1] = grayscaleValue;
                                                pixels[pixelDataIndex + 2] = grayscaleValue;
                                            }
                                        } else {
                                            // For all other layers, display in grayscale
                                            pixels[pixelDataIndex] = grayscaleValue;
                                            pixels[pixelDataIndex + 1] = grayscaleValue;
                                            pixels[pixelDataIndex + 2] = grayscaleValue;
                                        }
                                        pixels[pixelDataIndex + 3] = 255; // A
                                    }
                                }
                                
                                layerResults[neuronIndex] = imageData;
                            }
                            
                            results[layerIndex] = layerResults;
                        }
                        
                        // Only send results if this computation wasn't cancelled
                        if (currentComputationId === computationId) {
                            self.postMessage({
                                type: 'ALL_IMAGES_COMPUTED',
                                results: results,
                                computationId: computationId
                            });
                        }
                    }
                };
            `,s=new Blob([a],{type:"application/javascript"});this.worker=new Worker(URL.createObjectURL(s)),this.worker.onmessage=e=>{const{type:d,results:i,computationId:f}=e.data;d==="ALL_IMAGES_COMPUTED"&&f===this.computationId&&(this.images=i,this.onUpdate&&this.onUpdate())}}catch(a){console.warn("Web Worker not supported, falling back to main thread:",a),this.worker=null}}generateRandomWeights(){return[{weights:this.randomWeights(2,2),bias:this.randomBias(2)},{weights:this.randomWeights(2,3),bias:this.randomBias(3)}]}randomWeights(a,s){const e=[];for(let d=0;d<s;d++){const i=[];for(let f=0;f<a;f++)i.push(Math.random()-.5);e.push(i)}return e}randomBias(a){const s=[];for(let e=0;e<a;e++)s.push(Math.random()*.2);return s}computeAllImages(){this.worker&&this.worker.terminate(),this.computationId++;const a=this.computationId;this.setupWorker(),this.worker?this.worker.postMessage({type:"COMPUTE_ALL_IMAGES",data:{layers:this.layers,imageSize:n},computationId:a}):this.computeAllImagesSync()}computeAllImagesSync(){const a=n*n,s=new Array(a);for(let i=0;i<n;i++)for(let f=0;f<n;f++){const p=i*n+f;s[p]=[f/(n-1),1-i/(n-1)]}let e=s;const d=[e];for(let i=0;i<this.layers.length;i++){const f=this.layers[i],p=new Array(a);for(let y=0;y<a;y++){p[y]=new Array(f.weights.length);for(let m=0;m<f.weights.length;m++){let D=f.bias[m];for(let A=0;A<e[y].length;A++)D+=f.weights[m][A]*e[y][A];p[y][m]=D}}if(i<this.layers.length-1)for(let y=0;y<a;y++)for(let m=0;m<p[y].length;m++)p[y][m]=Math.max(0,p[y][m]);e=p,d.push(p.map(y=>[...y]))}this.images={};for(let i=0;i<this.layers.length;i++){const f=d[i+1];this.images[i]={};for(let p=0;p<this.layers[i].weights.length;p++){const y=new ImageData(n,n),m=y.data;for(let D=0;D<n;D++)for(let A=0;A<n;A++){const S=D*n+A,N=f[S][p],l=Math.max(0,Math.min(255,Math.round(N*255))),x=S*4;i===this.layers.length-1?p===0?(m[x]=l,m[x+1]=0,m[x+2]=0):p===1?(m[x]=0,m[x+1]=l,m[x+2]=0):p===2?(m[x]=0,m[x+1]=0,m[x+2]=l):(m[x]=l,m[x+1]=l,m[x+2]=l):(m[x]=l,m[x+1]=l,m[x+2]=l),m[x+3]=255}this.images[i][p]=y}}this.onUpdate&&this.onUpdate()}generateImageData(a,s=null){if(this.images[a]&&this.images[a][s])return this.images[a][s];const e=new ImageData(n,n),d=e.data;for(let i=0;i<d.length;i+=4)d[i]=0,d[i+1]=0,d[i+2]=0,d[i+3]=255;return e}updateLayers(a){this.layers=a,this.computeAllImages()}setOnUpdate(a){this.onUpdate=a}destroy(){this.worker&&this.worker.terminate()}}function U({imageData:g,size:a=ee,className:s="",onClick:e}){const d=k.useRef(null);return k.useEffect(()=>{const i=d.current;if(!i||!g)return;i.getContext("2d").putImageData(g,0,0)},[g]),t.jsx("canvas",{ref:d,width:n,height:n,style:{width:a,height:a},className:`border border-border rounded ${s}`,onClick:e})}function $({value:g,onChange:a,min:s="-2",max:e="2",step:d="0.01",className:i=""}){return t.jsxs("div",{className:`relative group ${i} w-full  `,children:[t.jsx("input",{type:"range",min:s,max:e,step:d,value:g,onChange:a,className:"absolute left-2 right-2 bottom-2 h-1 bg-secondary rounded appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary",style:{background:"linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)"}}),t.jsx("div",{className:"absolute -top-12 right-1 opacity-0 group-focus-within:opacity-100 transition-opacity",children:t.jsx("span",{className:"badge badge-secondary text-xs px-1 py-0 bg-black/70 text-white",children:g.toFixed(2)})})]})}function G({label:g,imageData:a,isSelected:s,onClick:e,showSliders:d,sliderValue:i,onSliderChange:f,isOutputLayer:p=!1,neuronIndex:y=0,onDelete:m=null,canDelete:D=!1,tt:A=null}){const S=p?y===0?"text-red-600":y===1?"text-green-600":"text-blue-600":"text-muted-foreground";return t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:`text-xs font-medium text-center mb-1 ${S}`,children:g}),t.jsxs("div",{className:"relative",children:[t.jsx(U,{imageData:a,size:100,className:`border border-border rounded cursor-pointer hover:ring-2 hover:ring-primary transition-all hover:scale-105 ${s?"ring-2 ring-primary scale-105":""}`,onClick:e}),D&&m&&A&&t.jsx("button",{onClick:N=>{N.stopPropagation(),window.confirm(A("confirmDeleteNeuron"))&&m()},className:"btn-icon absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 duration-200 shadow-lg",title:A("deleteNeuronTitle"),children:t.jsx("i",{className:"fas fa-times"})})]}),d&&t.jsx($,{value:i,onChange:f})]})}function Z({layerIndex:g,layer:a,currentLayers:s,selectedNeuron:e,network:d,inputImages:i,generateBiasImage:f,handleNeuronClick:p,handleCoefficientChange:y,handleBiasChange:m,handleAddNeuron:D=null,handleDeleteNeuron:A=null,handleDeleteLayer:S=null,handleAddLayer:N=null,tt:l}){const x=g===-1,R=g===s.length-1,M=e.layerIndex===(x?0:g+1);if(x)return t.jsxs("div",{className:"mb-8",children:[t.jsx("h3",{className:"text-lg font-semibold mb-4",children:l("layer0Title")}),t.jsxs("div",{className:"grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2",children:[t.jsx(G,{label:l("xCoord"),imageData:i.xImage,isSelected:!1,onClick:()=>{},showSliders:M,sliderValue:M?s[e.layerIndex].weights[e.neuronIndex][0]:0,onSliderChange:M?L=>{const v=parseFloat(L.target.value);y(e.layerIndex,e.neuronIndex,0,v)}:()=>{},canDelete:!1}),t.jsx(G,{label:l("yCoord"),imageData:i.yImage,isSelected:!1,onClick:()=>{},showSliders:M,sliderValue:M?s[e.layerIndex].weights[e.neuronIndex][1]:0,onSliderChange:M?L=>{const v=parseFloat(L.target.value);y(e.layerIndex,e.neuronIndex,1,v)}:()=>{},canDelete:!1}),M&&t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:"text-xs font-medium text-center mb-1 text-muted-foreground",children:l("bias")}),t.jsx("div",{className:"relative",children:t.jsx(U,{imageData:f(s[e.layerIndex].bias[e.neuronIndex]),size:100,className:"border border-border rounded"})}),t.jsx($,{value:s[e.layerIndex].bias[e.neuronIndex],onChange:L=>{const v=parseFloat(L.target.value);m(e.layerIndex,e.neuronIndex,v)}})]})]})]});const E=!(g===s.length-1);return t.jsxs("div",{className:"mb-8",children:[t.jsxs("div",{className:"flex items-center justify-between mb-4",children:[t.jsx("h3",{className:"text-lg font-semibold",children:l("layerTitle",{n:g+1})}),t.jsxs("div",{className:"flex items-center gap-2",children:[E&&N&&s.length<V&&t.jsx("button",{onClick:()=>N(g),className:"btn-icon text-green-500 hover:text-green-700 hover:bg-green-50",title:l("addLayerTitle"),children:t.jsx("i",{className:"fas fa-plus"})}),E&&S&&t.jsx("button",{onClick:()=>{window.confirm(l("confirmDeleteLayer"))&&S(g)},className:"btn-icon text-red-500 hover:text-red-700 hover:bg-red-50",title:l("deleteLayerTitle"),children:t.jsx("i",{className:"fas fa-trash"})})]})]}),t.jsxs("div",{className:"grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2",children:[a.weights.map((L,v)=>{const W=R?v===0?"R":v===1?"G":"B":l("neuronLabel",{n:v}),T=e.layerIndex===g&&e.neuronIndex===v;return t.jsx(G,{label:W,imageData:d.generateImageData(g,v),isSelected:T,onClick:()=>p(g,v),showSliders:M,sliderValue:M?s[e.layerIndex].weights[e.neuronIndex][v]:0,onSliderChange:M?F=>{const B=parseFloat(F.target.value);y(e.layerIndex,e.neuronIndex,v,B)}:()=>{},isOutputLayer:R,neuronIndex:v,canDelete:E,onDelete:A?()=>A(g,v):null,tt:l},v)}),E&&!M&&D&&a.weights.length<C&&t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:"text-xs font-medium text-center mb-1 text-muted-foreground",children:l("addNeuronLabel")}),t.jsx("button",{onClick:()=>D(g),className:"btn-icon flex flex-col items-center justify-center border-2 border-dashed border-input hover:border-primary hover:bg-accent h-24 w-24",title:l("addNeuronTitle"),children:t.jsx("i",{className:"fas fa-plus text-2xl text-muted-foreground hover:text-primary"})})]}),M&&t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:"text-xs font-medium text-center mb-1 text-muted-foreground",children:l("bias")}),t.jsx("div",{className:"relative",children:t.jsx(U,{imageData:f(s[e.layerIndex].bias[e.neuronIndex]),size:100,className:"border border-border rounded"})}),t.jsx($,{value:s[e.layerIndex].bias[e.neuronIndex],onChange:L=>{const v=parseFloat(L.target.value);m(e.layerIndex,e.neuronIndex,v)}})]})]})]})}function re({levelId:g,value:a,onChange:s}){const e=Q(),[d,i]=k.useState({layerIndex:-1,neuronIndex:-1}),[f,p]=k.useState(!1),[y,m]=k.useState(!1),[D,A]=k.useState(null),S=X[g]||X.basic,N=()=>{if(a&&typeof a=="object"&&a.layers){const u=a.layers;return u.length>V?(console.warn(`Too many layers: ${u.length} > ${V}, truncating`),u.slice(0,V)):u.map(o=>o.weights.length>C?(console.warn(`Too many nodes in layer: ${o.weights.length} > ${C}, truncating`),{weights:o.weights.slice(0,C),bias:o.bias.slice(0,C)}):o)}const r=new Y,c=r.generateRandomWeights();return r.destroy(),c},l=N(),[x]=k.useState(()=>{const r=new Y(N());return r.computeAllImages(),r});k.useEffect(()=>{x.updateLayers(l)},[l,x]),k.useEffect(()=>{if(!a||!a.layers){const r=x.generateRandomWeights();s&&s({layers:r})}},[a,s,x]),k.useEffect(()=>{x.setOnUpdate(()=>{p(!1)})},[x]),k.useEffect(()=>{S.imageSrc&&(m(!1),te(S.imageSrc).then(r=>{A(r),m(!0)}).catch(r=>{console.error("Failed to load image:",r)}))},[g,S.imageSrc]),k.useEffect(()=>{a&&a.layers&&(p(!0),x.updateLayers(a.layers))},[a,x]);const R=(r,c)=>{d.layerIndex===r&&d.neuronIndex===c?i({layerIndex:-1,neuronIndex:-1}):i({layerIndex:r,neuronIndex:c})},M=(r,c,u,h)=>{const o=l.map((w,I)=>I===r?{...w,weights:w.weights.map((j,b)=>b===c?j.map((z,_)=>_===u?parseFloat(h):z):j)}:w);p(!0),s&&s({layers:o})},P=(r,c,u)=>{const h=l.map((o,w)=>w===r?{...o,bias:o.bias.map((I,j)=>j===c?parseFloat(u):I)}:o);p(!0),s&&s({layers:h})},E=r=>{if(l[r].weights.length>=C){alert(`Maximum ${C} nodes per layer allowed`);return}const c=l.map((u,h)=>{if(h===r){const o=u.weights[0].length,w=Array(o).fill(0).map(()=>Math.random()-.5),I=Math.random()*.2;return{...u,weights:[...u.weights,w],bias:[...u.bias,I]}}else if(h===r+1)return{...u,weights:u.weights.map(o=>[...o,Math.random()-.5])};return u});p(!0),s&&s({layers:c})},L=(r,c)=>{const u=l.map((h,o)=>o===r?{...h,weights:h.weights.filter((w,I)=>I!==c),bias:h.bias.filter((w,I)=>I!==c)}:o===r+1?{...h,weights:h.weights.map(w=>w.filter((I,j)=>j!==c))}:h);p(!0),s&&s({layers:u})},v=r=>{if(l.length>=V){alert(`Maximum ${V} layers allowed`);return}const c=l[r].weights.length,u={weights:Array(c).fill(0).map((j,b)=>Array(c).fill(0).map((z,_)=>b===_?1:0)),bias:Array(c).fill(0)},h=r+1,o=l[h],w={...o,weights:o.weights.map(()=>Array(c).fill(0).map(()=>Math.random()-.5))},I=[...l.slice(0,h),u,w,...l.slice(h+1)];p(!0),s&&s({layers:I})},W=r=>{var u;const c=l.filter((h,o)=>o!==r);if(r<c.length){const h=c[r],o=c[r-1],w=((u=o==null?void 0:o.weights)==null?void 0:u.length)||2;c[r]={...h,weights:h.weights.map(I=>I.slice(0,w))}}p(!0),s&&s({layers:c})},T=k.useMemo(()=>{const r=new ImageData(n,n),c=new ImageData(n,n),u=r.data,h=c.data;for(let o=0;o<n;o++)for(let w=0;w<n;w++){const I=Math.round(w/(n-1)*255),j=Math.round((1-o/(n-1))*255),b=(o*n+w)*4;u[b]=I,u[b+1]=I,u[b+2]=I,u[b+3]=255,h[b]=j,h[b+1]=j,h[b+2]=j,h[b+3]=255}return{xImage:r,yImage:c}},[]),F=k.useMemo(()=>{const r=l.length-1,c=x.generateImageData(r,0),u=x.generateImageData(r,1),h=x.generateImageData(r,2);if(!c||!u||!h){const I=new ImageData(n,n),j=I.data;for(let b=0;b<j.length;b+=4)j[b]=0,j[b+1]=0,j[b+2]=0,j[b+3]=255;return I}const o=new ImageData(n,n),w=o.data;for(let I=0;I<n;I++)for(let j=0;j<n;j++){const b=(I*n+j)*4,z=(I*n+j)*4,_=c.data[z],H=u.data[z+1],q=h.data[z+2];w[b]=_,w[b+1]=H,w[b+2]=q,w[b+3]=255}return o},[l,f,x]),B=r=>{const c=new ImageData(n,n),u=c.data,h=Math.max(0,Math.min(255,Math.round((r+1)*127.5)));for(let o=0;o<u.length;o+=4)u[o]=h,u[o+1]=h,u[o+2]=h,u[o+3]=255;return c};return t.jsx("div",{className:"main-content",children:t.jsxs("div",{className:"mb-6",children:[t.jsxs("div",{className:"mb-8",children:[t.jsx("h3",{className:"text-lg font-semibold mb-4",children:e("networkOutputVsTarget")}),t.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:"text-xs font-medium text-center mb-1 text-muted-foreground",children:e("yourOutput")}),t.jsx("div",{className:"relative",children:t.jsx(U,{imageData:F,size:120,className:"border border-gray-300 rounded"})})]}),t.jsxs("div",{className:"relative group flex flex-col items-center",children:[t.jsx("p",{className:"text-xs font-medium text-center mb-1 text-muted-foreground",children:e("target")}),t.jsxs("div",{className:"relative",children:[t.jsx(U,{imageData:S.imageSrc?D||O((r,c)=>[r,c,0]):S.targetImage,size:120,className:"border border-gray-300 rounded"}),S.imageSrc&&!y&&t.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-muted rounded",children:t.jsx("div",{className:"text-xs text-muted-foreground",children:e("loading")})})]})]})]})]}),l.map((r,c)=>t.jsx(Z,{layerIndex:c,layer:r,currentLayers:l,selectedNeuron:d,network:x,inputImages:T,generateBiasImage:B,handleNeuronClick:R,handleCoefficientChange:M,handleBiasChange:P,handleAddNeuron:E,handleDeleteNeuron:L,handleDeleteLayer:W,handleAddLayer:v,tt:e},c)).reverse(),t.jsx(Z,{layerIndex:-1,layer:null,currentLayers:l,selectedNeuron:d,network:x,inputImages:T,generateBiasImage:B,handleNeuronClick:R,handleCoefficientChange:M,handleBiasChange:P,handleAddNeuron:null,handleDeleteNeuron:null,handleDeleteLayer:null,handleAddLayer:null,tt:e})]})})}export{re as default};
