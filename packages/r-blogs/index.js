/**
 * 思路
 * 1. 传入文件路径，文件格式，要排除的文件目录等
 * 2. 根据文件路径生成目录数据
 * 3. 根据目录数据生成html内容
 * 4. 根据html内容生成完整的html文件
 * 5. 定制该html文件的样式，支持样式文件和内联样式
 * 5. 启动本地服务，访问该html文件
*/
let fs = require('fs');
let path = require('path');

/**
 * options
 *  filePath 文件路径
 *  fileExtension 文件后缀
 *  excludeFilePath 排除的文件路径
 *  theme 主题样式
 * **/
class fileLoader {
    constructor(options){
        let { filePath, theme } = options;
        this.options = options;
        this.files = this.onGetFiles(filePath, 0);
        this.htmlTemplate = this.onGetHtmlTemplate(this.files, theme);
        console.log(this.htmlTemplate);
    }

    /**
     * 根据文件路径生成目录数据
    */
    onGetFiles(filePath, level){
        let { excludeFilePath, fileExtension}  = this.options;
        let data = {
            path: filePath,
            name: path.basename(filePath),
            type: 'directory',
            level
        };
        let files = fs.readdirSync(filePath);
        level ++; 
        data.children = files.map(file => {
            // 过滤文件
            if(excludeFilePath.includes(file)) return;
            // 获取文件相对路径
            let subPath = path.join(filePath, file);  
            // 读取文件信息对象
            let stats = fs.statSync(subPath);
            // 如果是文件夹
            if(stats.isDirectory()){
                return this.onGetFiles(subPath, level);
            }
            // 后缀验证
            let ext = path.extname(file);
            if(fileExtension && !fileExtension.includes(ext)) return;
            return {
                path: subPath,
                name: file,
                type: 'file',
                level
            }
        }).filter(i => i);
        return data;
    }

    /**
     * 根据目录数据生成html内容
    */
   onGetHtmlTemplate(files, theme = 'default'){
       if(!files) return;
       this.html = '';

       return `<div class="m-blogs-${theme}">
        <div class="blogs-title">主页${files.name}</div>
        <div class="blogs-list">
            ${this.onGetItemTemplate(files.children)}
        </div>
       </div>`;
   }

   /**
    * 获取模板内容
   */
  onGetItemTemplate(list = []){
    list.map(item => {
        this.html += `<div class="blogs-item">
                        <a href="${item.path}">目录层级${item.level}-${item.name}</a>
                    </div>`;
        item.children && item.children.length && this.onGetItemTemplate(item.children);
    })
    return this.html;
  }
}

module.exports = new fileLoader({
    filePath: './',
    fileExtension: ['md', 'html'],
    excludeFilePath: [''],
    theme: 'default'
})