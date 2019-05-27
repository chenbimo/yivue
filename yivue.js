#!/usr/bin/env node

// 引入模块 ==================================================================
// 引入文件系统
const fs = require("fs");

// 引入路径系统
const path = require("path");

// 引入命令行颜色库
const colors = require("colors/safe");

// 引入文件监听模块
const chokidar = require("chokidar");

// 引入工具函数
const tool = require("./tool");

// 引入less
const lessCompile = require("./lessCompile");

// 初始化配置参数 ==============================================================
// 配置目录
const config_dir = process.cwd();

// 配置文件
const config_file = path.join(config_dir, "yivue.config.js");
if (!fs.existsSync(config_file)) {
    console.log(colors.red("配置文件不存在"));
    return;
}
// 配置数据
const config_data = require(config_file);

async function yivue() {
    // 循环处理多个单页项目 =========================================================
    for (let prop of config_data) {
        // 如果状态为false，则跳过处理
        // 此参数可以过滤掉不需要打包的项目，增加性能
        if (!prop.status) {
            continue;
        }
        // 为每个单页项目初始化相关变量 ==============================================
        // 组件模板数组
        let html_components = [];

        // 页面模板数组
        let html_pages = [];

        // 页面css数组
        let html_css = [];

        // 单组件、单页面的js脚本

        // 数据文件 - 保留
        // let js_datas = [];

        // 组件脚本文件
        let js_components = [];

        // 页面脚本文件
        let js_pages = [];

        // 路由脚本文件
        let js_routes = [];

        // 独立css合并文件
        let css_array = [];

        // 正则字符

        // 正则字符-默认-开始
        let str_default_start = "[\\s\\S]*<script.+yv-type=[\"']?text/";

        // 正则字符-默认-结束
        let str_default_end = "[\"']?>([\\s\\S]+?)</script>";

        // 页面模板正则字符
        let str_template = "[\\s\\S]*<template>([\\s\\S]+?)</template>";

        // 正则字符-数据 -保留
        // let str_data = str_default_start + "data" + str_default_end;

        // 正则字符-组件
        let str_component = str_default_start + "component" + str_default_end;

        // 正则字符-页面
        let str_page = str_default_start + "page" + str_default_end;

        // 正则字符-路由
        let str_route = str_default_start + "route" + str_default_end;

        // 正则字符-css
        let str_css = "[\\s\\S]*<style.*>([\\s\\S]+?)</style>";

        // 文件读取

        // 读取的所有文件
        let files_all = null;

        // 过滤之后的 html 模板文件
        let files_filter = null;

        // 状态变量

        // 检测结果是否成功状态
        let check_success = true;

        // 检测循环处理数据状态
        let check_data = true;

        // 检测文件是否存在状态
        let check_exists = true;

        // 模板文件名占位符 - 有bug，待定
        let placeholder = "ddd";

        // 正则-模板 - 有bug，待定
        let regx_placeholder = new RegExp(placeholder, "gi");

        // 正则-页面元素
        let regx_template = new RegExp(str_template, "gi");

        // 正则-数据 - 保留
        // let regx_data = new RegExp(str_data, "gi");

        // 正则-组件脚本
        let regx_component = new RegExp(str_component, "gi");

        // 正则-页面脚本
        let regx_page = new RegExp(str_page, "gi");

        // 正则-路由脚本
        let regx_route = new RegExp(str_route, "gi");

        // 正则-css脚本
        let regx_css = new RegExp(str_css, "gi");

        // 首页文件数据

        // 缓存首页页面数据
        // let data_index = "";

        // 获取配置文件的参数 ==============================================
        let {
            // 当前单页项目标识名
            name = "",

            // 源码目录
            src_dir = "src",

            // 生成目录
            dist_dir = "client",

            // 组件目录
            components_dir = "components",

            // 页面目录
            pages_dir = "pages",

            // css目录
            css_dir = "css",

            // 生成的数据文件默认名称
            // data_file = "datas.js",

            // 生成的组件文件默认名称
            component_file = "components.js",

            // 生成的页面文件默认名称
            page_file = "pages.js",

            // 生成的路由文件默认名称
            route_file = "routes.js",

            // 生成的样式文件默认名称
            css_file = "bundle.css",

            // 来源模板默认名称
            from_html = "tpl.html",

            // 目标单页文件名称
            to_html = "index.html",

            // 来源入口脚本
            from_app = "app.js",

            // 目标入口脚本
            to_app = "app.js",

            // 来源配置文件
            from_config = "config.js",

            // 目标配置文件
            to_config = "config.js"
        } = prop;

        // 是否填写项目名称
        if (!name) {
            console.log(colors.red("请填写项目名称 " + JSON.stringify(p)));
            check_success = false;
            break;
        }

        // 根据参数生成目录和路径 ===================================================
        // 源码目录
        src_dir = path.join(config_dir, src_dir);

        // 组件目录
        components_dir = path.join(src_dir, components_dir);

        // 页面目录
        pages_dir = path.join(src_dir, pages_dir);

        // css目录
        css_dir = path.join(src_dir, css_dir);

        // 生成的资源目录
        dist_dir = path.join(config_dir, dist_dir);

        // 静态网页模板文件
        from_html = path.join(src_dir, from_html);

        // 静态单页文件
        to_html = path.join(dist_dir, to_html);

        // 入口源文件
        from_app = path.join(src_dir, from_app);

        // 入口目标文件
        to_app = path.join(dist_dir, to_app);

        // 数据源文件
        from_config = path.join(src_dir, from_config);

        // 数据目标文件
        to_config = path.join(dist_dir, to_config);

        // 判断资源目录是否存在
        if (!fs.existsSync(dist_dir)) {
            fs.mkdirSync(path.join(dist_dir), { recursive: true });
        }

        // 需要被检测的参数数组 ==================================================
        let check_params = [src_dir, dist_dir, components_dir, pages_dir, from_html, from_app, from_config];

        for (let prop of check_params) {
            if (!fs.existsSync(prop)) {
                console.log(colors.red(`项目名称<${name}>  类型<目录>  目录地址<${prop}>  不存在...`));
                check_exists = false;
                break;
            }
        }

        // 路径存在性判断中断
        if (check_exists === false) {
            check_success = false;
            break;
        }

        // 开始处理组件资源 ========================================================
        // 获取所有组件文件
        files_all = fs.readdirSync(components_dir, { withFileTypes: true });

        // 过滤所有非 .html 文件
        files_filter = files_all.filter(v => {
            return v.isFile() && path.extname(v.name) === ".html";
        });

        // 循环读取所有组件数据
        for (let prop of files_filter) {
            // 文件名称(不含扩展名)
            let name_base = path.basename(prop.name, ".html");

            // 合成组件文件名
            let name_component = "component-" + name_base;

            // 当前组件路径
            let path_component = path.join(components_dir, prop.name);

            // 当前组件页面数据
            let data_html = fs.readFileSync(path_component, { encoding: "utf8" });

            // 检测是否有模板数据
            if (!regx_template.test(data_html)) {
                console.log(colors.red(`项目名称<${name}>  类型<组件/模板>  文件名<${prop.name}>  未找到...`));
                check_data = false;
                break;
            }

            // 检测是否有组件脚本
            if (!regx_component.test(data_html)) {
                console.log(colors.red(`项目名称<${name}>  类型<组件/脚本>  文件名<${prop.name}>  未找到...`));
                check_data = false;
                break;
            }

            // 正则查找模板元素数据
            data_html.replace(regx_template, (match, template) => {
                template = template.trim().replace(regx_placeholder, (_, n) => {
                    return name_base;
                });
                // 缓存组件模板资源
                html_components.push(`<script type="text/html" id="${name_component}">\n${template}\n</script>\n`);
            });

            // 正则查找组件脚本数据
            data_html.replace(regx_component, (match, component) => {
                component = component
                    .trim()
                    .replace(/^([\S\s]+?)\{/gi, (_, s) => {
                        return "{";
                    })
                    .replace(regx_placeholder, (_, n) => {
                        return name_base;
                    });
                // 缓存组件脚本资源
                js_components.push(`yivue.components["${name_component}"] = ${component}\n\n`);
            });

            // 正则查找组件css数据
            await data_html.replace(regx_css, (match, style) => {
                style = style.trim().replace(regx_placeholder, (_, n) => {
                    return name_base;
                });
                // 缓存页面css资源
                html_css.push(`\n${style}\n`);
            });
            console.log(colors.green(`项目名称<${name}>  类型<组件>  文件名<${prop.name}>  处理完成...`));
        }
        // 数据存在性判断
        if (check_data === false) {
            check_success = false;
            break;
        }

        // 开始处理页面资源 ======================================================
        // 获取所有文件
        files_all = fs.readdirSync(pages_dir, { withFileTypes: true });

        // 过滤所有非 .html 文件
        files_filter = files_all.filter(v => {
            return v.isFile() && path.extname(v.name) === ".html";
        });

        // 循环读取所有页面数据
        for (let prop of files_filter) {
            // 文件名称(不含扩展名)
            let name_base = path.basename(prop.name, ".html");

            // 合成页面文件名
            let name_page = "page-" + name_base;

            // 当前页面路径
            let path_page = path.join(pages_dir, prop.name);

            // 当前页面数据
            let data_html = fs.readFileSync(path_page, { encoding: "utf8" });

            // 检测是否有模板
            if (!regx_template.test(data_html)) {
                console.log(colors.red(`项目名称<${name}>  类型<模板>  文件名<${prop.name}>  未找到...`));
                check_data = false;
                break;
            }

            // 检测是否有页面
            if (!regx_page.test(data_html)) {
                console.log(colors.red(`项目名称<${name}>  类型<页面脚本>  文件名<${prop.name}>  未找到...`));
                check_data = false;
                break;
            }

            // 检测是否有路由
            if (!regx_route.test(data_html)) {
                console.log(colors.red(`项目名称<${name}>  类型<页面路由>  文件名<${prop.name}>  未找到...`));
                check_data = false;
                break;
            }

            // 正则查找页面模板数据
            data_html.replace(regx_template, (match, template) => {
                template = template.trim().replace(regx_placeholder, (_, n) => {
                    return name_base;
                });
                // 缓存页面模板资源
                html_pages.push(`<script type="text/html" id="${name_page}">\n${template}\n</script>\n`);
            });

            // 正则查找页面脚本
            data_html.replace(regx_page, (match, page) => {
                page = page
                    .trim()
                    .replace(/^([\S\s]+?)\{/gi, (_, s) => {
                        return "{";
                    })
                    .replace(regx_placeholder, (_, n) => {
                        return name_base;
                    });
                // 缓存页面脚本资源
                js_pages.push(`yivue.pages["${name_page}"] = ${page}\n\n`);
            });

            // 正则查找路由脚本
            data_html.replace(regx_route, (match, route) => {
                route = route
                    .trim()
                    .replace(/^([\S\s]+?)\{/gi, (_, s) => {
                        // 去掉变量赋值
                        return "{";
                    })
                    .replace(/\}\;$/gi, (_, n) => {
                        // 去掉路由结束扩后后面的分号
                        return "}";
                    })
                    .replace(regx_placeholder, (_, n) => {
                        // 替换占位符
                        return name_base;
                    });
                // 缓存页面路由资源
                js_routes.push(`yivue.routes.push(${route})\n\n`);
            });

            // 正则查找页面css数据
            await data_html.replace(regx_css, (match, style) => {
                //console.log(style.trim().replace(regx_placeholder, "000"));
                // 先处理占位符
                style = style.trim().replace(regx_placeholder, (_, n) => {
                    return name_base;
                });
                // 缓存页面css资源
                html_css.push(`\n${style}\n`);
            });

            // 打印日志
            console.log(colors.green(`项目名称<${name}>  类型<页面>  文件名<${prop.name}>  处理完成...`));
        }
        // 开始处理css资源 ======================================================
        // 获取所有文件
        files_all = fs.readdirSync(css_dir, { withFileTypes: true });

        // 过滤所有非 .css或.less 文件
        files_filter = files_all.filter(v => {
            return (
                v.isFile() &&
                [".css", ".less"].some(vv => {
                    return path.extname(v.name) === vv;
                })
            );
        });

        // 循环读取所有css
        for (let prop of files_filter) {
            // 当前css路径
            let path_css = path.join(css_dir, prop.name);

            // 当前组件页面数据
            let data_css = fs.readFileSync(path_css, { encoding: "utf8" });

            // 推送到数组
            css_array.push(data_css);
        }

        // 数据判断中断
        if (check_data === false) {
            check_success = false;
            break;
        }

        // 文件生成 ========================================================

        // 生成数据文件
        //fs.writeFileSync(path.join(dist_dir, data_file), 'var yivue_datas = {};\n\n' + js_datas.join(''));

        // 生成组件文件
        fs.writeFileSync(path.join(dist_dir, component_file), js_components.join(""));

        // 生成页面文件
        fs.writeFileSync(path.join(dist_dir, page_file), js_pages.join(""));

        // 生成路由文件
        fs.writeFileSync(path.join(dist_dir, route_file), js_routes.join(""));

        let lessRes = await lessCompile([...css_array, ...html_css].join(""), {});

        // 生成样式文件
        fs.writeFileSync(path.join(dist_dir, css_file), lessRes.code ? lessRes.data : "");

        // 读 html 模板文件
        let data_from_html = fs.readFileSync(path.join(from_html), { encoding: "utf8" });

        // 替换 html 模板文件占位符
        let data_to_html = data_from_html.replace(/\<\!\-\-\[\:yivue_components\]\-\-\>/gi, html_components.join("")).replace(/\<\!\-\-\[\:yivue_pages\]\-\-\>/gi, html_pages.join(""));

        // 生成首页文件
        fs.writeFileSync(path.join(to_html), data_to_html);

        // 读 app.js 模板文件
        let data_from_app = fs.readFileSync(path.join(from_app), { encoding: "utf8" });

        // 生成 app.js 文件
        fs.writeFileSync(path.join(to_app), data_from_app);

        // 读 config.js 模板文件
        let data_from_config = fs.readFileSync(path.join(from_config), { encoding: "utf8" });

        // 生成 config.js 文件
        fs.writeFileSync(path.join(to_config), data_from_config);

        // 成功判断
        if (check_success === false) {
            console.log(colors.red(name + " 处理失败...\n"));
        } else {
            console.log("---------------------------------");
            console.log(colors.bgCyan(tool.DateTime()));
            console.log("---------------------------------");
        }
    }
}

yivue();

// 缓冲变量，避免频繁打包
let timeold = Date.now();
let timenew = 0;
let timeout = 1000;
let watcher = chokidar
    .watch(path.join(config_dir, "src"), {
        ignored: /(^|[\/\\])\../
    })
    .on("unlink", path => {
        timenew = Date.now();
        if (timenew - timeold > timeout) {
            yivue();
            timeold = timenew;
        }
    })
    .on("change", path => {
        timenew = Date.now();
        if (timenew - timeold > timeout) {
            yivue();
            timeold = timenew;
        }
    });
