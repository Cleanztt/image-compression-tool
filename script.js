/**
 * 图片压缩工具的主要JavaScript代码
 * @author Your Name
 * @version 1.0.0
 */

// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imageList = document.getElementById('imageList');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const imageItemTemplate = document.getElementById('imageItemTemplate');

// 存储所有待处理的图片
const images = new Map();

/**
 * 初始化拖放区域的事件监听
 */
function initializeDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
}

/**
 * 阻止默认事件
 * @param {Event} e - 事件对象
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * 高亮拖放区域
 */
function highlight() {
    dropZone.classList.add('highlight');
}

/**
 * 取消高亮拖放区域
 */
function unhighlight() {
    dropZone.classList.remove('highlight');
}

/**
 * 处理文件拖放
 * @param {DragEvent} e - 拖放事件对象
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    handleFiles(dt.files);
}

/**
 * 更新所有图片的序号显示
 */
function updateImageNumbers() {
    const items = Array.from(images.values());
    items.forEach((imageData, index) => {
        const numberElement = imageData.element.querySelector('.image-number');
        if (items.length > 1) {
            numberElement.textContent = `${index + 1}`;
            numberElement.classList.add('show');
        } else {
            numberElement.classList.remove('show');
        }
    });
}

/**
 * 处理多个文件
 * @param {FileList} files - 文件列表
 */
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert(`文件 "${file.name}" 不是图片文件！`);
            return;
        }
        addImageToList(file);
    });
    updateBatchButtons();
    updateImageNumbers();
}

/**
 * 将图片添加到列表
 * @param {File} file - 图片文件
 */
function addImageToList(file) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const imageItem = createImageItem(id, file);
    imageList.appendChild(imageItem);
    images.set(id, { file, element: imageItem });
    displayOriginalImage(id, file);
    compressImage(id, file);
}

/**
 * 创建图片项目元素
 * @param {string} id - 图片ID
 * @param {File} file - 图片文件
 * @returns {HTMLElement} 图片项目元素
 */
function createImageItem(id, file) {
    const template = imageItemTemplate.content.cloneNode(true);
    const imageItem = template.querySelector('.image-item');
    imageItem.dataset.id = id;

    // 设置文件名
    imageItem.querySelector('.file-name').textContent = file.name;

    // 设置压缩质量滑块事件
    const qualitySlider = imageItem.querySelector('.quality-slider');
    const qualityValue = imageItem.querySelector('.quality-value');
    qualitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        qualityValue.textContent = `${value}%`;
        compressImage(id, file, value);
    });

    // 设置下载按钮事件
    const downloadBtn = imageItem.querySelector('.download-button');
    downloadBtn.addEventListener('click', () => downloadImage(id));

    // 设置删除按钮事件
    const removeBtn = imageItem.querySelector('.remove-button');
    removeBtn.addEventListener('click', () => removeImage(id));

    return imageItem;
}

/**
 * 显示原始图片
 * @param {string} id - 图片ID
 * @param {File} file - 图片文件
 */
function displayOriginalImage(id, file) {
    const imageItem = document.querySelector(`.image-item[data-id="${id}"]`);
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = imageItem.querySelector('.original-preview');
        img.src = e.target.result;
        img.onload = function() {
            imageItem.querySelector('.original-dimensions').textContent = 
                `${this.width} x ${this.height}`;
        };
        imageItem.querySelector('.original-size').textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);
}

/**
 * 压缩图片
 * @param {string} id - 图片ID
 * @param {File} file - 图片文件
 * @param {number} [quality] - 压缩质量（1-100）
 */
function compressImage(id, file, quality = 80) {
    const imageItem = document.querySelector(`.image-item[data-id="${id}"]`);
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    const compressedPreview = imageItem.querySelector('.compressed-preview');
                    compressedPreview.src = URL.createObjectURL(blob);
                    
                    imageItem.querySelector('.compressed-size').textContent = 
                        formatFileSize(blob.size);
                    imageItem.querySelector('.compressed-dimensions').textContent = 
                        `${canvas.width} x ${canvas.height}`;
                    
                    const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
                    imageItem.querySelector('.compression-ratio').textContent = 
                        `${compressionRatio}%`;

                    // 存储压缩后的blob
                    images.get(id).compressedBlob = blob;
                },
                'image/jpeg',
                quality / 100
            );
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 下载单个压缩后的图片
 * @param {string} id - 图片ID
 */
function downloadImage(id) {
    const imageData = images.get(id);
    if (!imageData || !imageData.compressedBlob) return;

    const link = document.createElement('a');
    link.download = `compressed_${imageData.file.name}`;
    link.href = URL.createObjectURL(imageData.compressedBlob);
    link.click();
}

/**
 * 下载所有压缩后的图片
 */
async function downloadAllImages() {
    // 如果有多个图片，创建ZIP文件
    if (images.size > 1) {
        const zip = new JSZip();
        
        for (const [id, imageData] of images) {
            if (imageData.compressedBlob) {
                zip.file(`compressed_${imageData.file.name}`, imageData.compressedBlob);
            }
        }

        const blob = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.download = 'compressed_images.zip';
        link.href = URL.createObjectURL(blob);
        link.click();
    } else if (images.size === 1) {
        // 如果只有一个图片，直接下载
        downloadImage(Array.from(images.keys())[0]);
    }
}

/**
 * 移除图片
 * @param {string} id - 图片ID
 */
function removeImage(id) {
    const imageData = images.get(id);
    if (!imageData) return;

    imageData.element.remove();
    images.delete(id);
    updateBatchButtons();
    updateImageNumbers();
}

/**
 * 更新批量操作按钮的显示状态
 */
function updateBatchButtons() {
    const hasMultipleImages = images.size > 1;
    downloadAllBtn.style.display = hasMultipleImages ? 'block' : 'none';
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化事件监听
initializeDragAndDrop();

// 文件选择事件
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // 清空input，允许重复选择相同文件
});

// 批量下载按钮事件
downloadAllBtn.addEventListener('click', downloadAllImages);

// 动态加载JSZip库
if (images.size > 1) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
} 