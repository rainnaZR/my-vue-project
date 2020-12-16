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

class fileLoader {
    constructor(options){
        let { filePath, theme } = options;
        this.options = options;
        this.files = this.onGetFiles(filePath);
        this.htmlTemplate = this.onGetHtmlTemplate(this.files, theme);
        console.log(this.htmlTemplate);
    }

    /**
     * 根据文件路径生成目录数据
    */
    onGetFiles(filePath){
        let { excludeFilePath, fileExtension}  = this.options;
        let data = {
            path: filePath,
            name: path.basename(filePath),
            type: 'directory'
        };
        let files = fs.readdirSync(filePath);
        data.children = files.map(file => {
            // 过滤文件
            if(excludeFilePath.includes(file)) return;
            // 获取文件相对路径
            let subPath = path.join(filePath, file);  
            // 读取文件信息对象
            let stats = fs.statSync(subPath); 
            // 如果是文件夹
            if(stats.isDirectory()){
                return this.onGetFiles(subPath);
            }
            // 后缀验证
            let ext = path.extname(file);
            if(fileExtension && !fileExtension.includes(ext)) return;
            return {
                path: subPath,
                name: file,
                type: 'file'
            }
        }).filter(i => i);
        return data;
    }

    /**
     * 根据目录数据生成html内容
    */
   onGetHtmlTemplate(files, theme = 'default'){
        if(!files || !files.length) return `<div>暂无内容</div>`;
        let className = `m-blogs-${theme}`;
        return files.map(file => (`<div class=${className}>
            ${this.onGetItemTemplate(file)}
        </div>`));
   }

   /**
    * 获取模板内容
   */
  onGetItemTemplate(file){
      let { path, name, type } = file;
      if(type == 'directory'){
        return `<div class="blogs-item">
        ${name}
        </div>`
      }
  }
}

new fileLoader({
    filePath: './',
    fileExtension: ['md', 'html'],
    excludeFilePath: [''],
    theme: 'default'
})

