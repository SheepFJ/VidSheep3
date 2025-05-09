//https://raw.githubusercontent.com/SheepFJ/VidSheep3/refs/heads/main/main/main.js

// 通用工具函数和环境检测
const isLoon = typeof $persistentStore !== "undefined";
const isQuanX = typeof $prefs !== "undefined";
const isSurge = !isLoon && !isQuanX; // 其他环境按Surge处理

// 统一存储方法
const storage = {
    get: key => {
        let value = null;
        if (isLoon || isSurge) value = $persistentStore.read(key);
        if (isQuanX) value = $prefs.valueForKey(key);

        try {
            // 尝试将字符串解析为对象
            return value ? JSON.parse(value) : null;
        } catch (e) {
            // 如果解析失败，返回原始值
            return value;
        }
    },
    set: (key, value) => {
        // 将对象转换为JSON字符串
        const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;

        if (isLoon || isSurge) return $persistentStore.write(jsonValue, key);
        if (isQuanX) return $prefs.setValueForKey(jsonValue, key);
        return false;
    }
};

// 统一通知方法
const notify = (title, subtitle, message) => {
    if (isLoon || isSurge) {
        $notification.post(title, subtitle, message);
    } else if (isQuanX) {
        $notify(title, subtitle, message);
    }
};



// 统一 HTTP 请求方法
function fetchWithCallback(options, callback) {
    if (isLoon || isSurge) {
        if (options.method === "POST") {
            $httpClient.post(options, callback);
        } else {
            $httpClient.get(options, callback);
        }
    } else if (isQuanX) {
        $task.fetch(options).then(response => {
            callback(null, response, response.body);
        }).catch(error => {
            notify("请求失败", "", JSON.stringify(error));
            callback(error, null, null);
        });
    }
}

//时间戳函数getCurrent,addMinutes(timestamp, minutes),isValid(currentTimestamp, oldTimestamp)
const TimestampUtil = {
    // 获取当前时间戳
    getCurrent: function () {
        return new Date().getTime();
    },

    // 获取当前时间戳加 n 分钟后的时间戳
    addMinutes: function (timestamp, minutes) {
        return timestamp + minutes * 60 * 1000;
    },

    // 比较时间戳，如果当前时间大于旧时间戳，返回 true 确认修改壁纸
    isValid: function (currentTimestamp, oldTimestamp) {
        return currentTimestamp >= oldTimestamp;
    }
};

// 统一返回状态
function responseStatus(success, data, array) {
    return {
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: `${success}`,
            data: {
                information: `${data}`,
                array: array // 直接传递数组，不使用模板字符串
            }
        })
    }
}


//api参数获取函数
function URLSearchParamsApi(queryString) {
    const params = {};
    if (!queryString) return {
        get: (key) => params[key] || null
    };

    const pairs = queryString.split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        const key = decodeURIComponent(pair[0]);
        const value = pair.length > 1 ? decodeURIComponent(pair[1]) : '';
        params[key] = value;
    }

    return {
        get: (key) => params[key] || null
    };
}

//用户数据定义
let vidSheepUserinfo = {
    BGimage: "", // 图片地址
    BG_brightness: "", //背景明度
    auto_change_BG: true, //自动更换壁纸,24小时更换一次   
    current_timestamp: 0, //当前时间戳
    old_timestamp: 0, //上次更换时间戳
    default_source: 2, //默认搜索来源
    announcement: 1, //	用于是否展示公告
    initialization: false, //f表示未初始化,t表示已初始化
    tripartiteplayer: "SenPlayer://x-callback-url/play?url=", //三方播放器
    searchkeywords: ["小猪佩奇", "熊出没", "海绵宝宝", "奥特曼", "哆啦A梦", "名侦探柯南", "喜羊羊与灰太狼"], //搜索历史
    apiSources: {
        "1": "https://jszyapi.com/api.php/provide/vod?ac=detail&wd=",//急速资源
        "2": "https://caiji.moduapi.cc/api.php/provide/vod?ac=detail&wd=",//魔都资源
        "3": "https://suoniapi.com/api.php/provide/vod?ac=detail&wd=",//索尼资源
        "4": "https://subocaiji.com/api.php/provide/vod?ac=detail&wd=",//速播资源
        "5": "https://cj.lziapi.com/api.php/provide/vod?ac=detail&wd=",//量子资源
        "6": "https://cj.lziapi.com/api.php/provide/vod/from/lzm3u8/?ac=detail&wd=",//量子资源1
        "7": "https://p2100.net/api.php/provide/vod?ac=detail&wd=",//飘零资源
        "8": "https://img.smdyw.top/api.php/provide/vod?ac=detail&wd=",//苹果资源
        "9": "https://360zy.com/api.php/seaxml/vod?ac=detail&wd=",//360资源
        "10": "https://api.guangsuapi.com/api.php/provide/vod/from/gsm3u8/?ac=detail&wd=",//光束资源
        "11": "https://collect.wolongzyw.com/api.php/provide/vod?ac=detail&wd=",//卧龙资源
        "12": "https://bfzyapi.com/api.php/provide/vod?ac=detail&wd=",//暴风资源
        "13": "https://api.zuidapi.com/api.php/provide/vod/?ac=detail&wd=",//最大
    }  //搜索源
}

// 对象数据
let vidSheepUserinfoData = storage.get("vidSheepUserinfo")

if (vidSheepUserinfoData && vidSheepUserinfoData.initialization) {

    console.log("已初始化")
} else {
    console.log("未初始化")

    vidSheepUserinfo.initialization = true
    storage.set("vidSheepUserinfo", vidSheepUserinfo)
}


// 收藏数据定义
let vidSheepCollection = {

}


// 最近搜索影视定义
let vidSheepRecent = {
    vidlist: [
        {
            vid_id: "21508",//影视id
            vid_name: "剑来",//影视名称
            vid_img: "https://tu.modututu.com/upload/vod/20240815-1/b06d6f0b3fe44413965cc32f87aff81b.jpg",//影视图片
            vid_source: "1",//影视来源
            vid_play_url: ["https://play.modujx15.com/20240815/g71ZekcK/index.m3u8"],//影视播放地址
            vid_play_name: ["第01集"],//影视播放集数
            vid_content: "大千世界，无奇不有。骊珠洞天中本该有大气运的贫寒少年，因为本命瓷碎裂的缘故，使得机缘临身却难以捉住。基于此，众多大佬纷纷以少年为焦点进行布局，使得少年身边的朋友获得大机缘，而少年却置身风口浪尖之上…",//影视简介
            vid_actor: "陈张太康,李敏,陈浩,云惟一,徐宇隆,惠龙,万舒心,贺文潇,刘校妤,凌振赫,白雪岑,黄嘉炜,杨默,杨天翔,赵铭洲,赵毅,张惠霖,锦鲤",//影视演员
            vid_time_final: "2024-12-14 21:55:09",//影视更新时间
        }
    ]
}

// 对象数据
let vidSheepRecentData = storage.get("vidSheepRecent")

if (vidSheepRecentData) {

    console.log("已初始化影视搜索")
} else {
    console.log("未初始化影视搜索")
    storage.set("vidSheepRecent", vidSheepRecent)
}





const url = $request.url;
// 路由处理器映射表
const routeHandlers = {
    // 主页面路由
    main: {
        match: (url) => url.includes('/sheep/VidSheep/main'),
        handle: handleMain
    },
    // API路由
    api: {
        match: (url) => url.includes('/sheep/VidSheep/api/'),
        handlers: {
            // 用户信息
            userinfo: {
                match: (url) => url.includes('/?userinfo'),
                handle: handleUserInfo
            },
            // 公告信息
            announcement: {
                match: (url) => url.includes('/?announcement'),
                handle: handleUserInfo
            },
            // 影视搜索
            search: {
                match: (url) => url.includes('/?search'),
                handle: handleSearch
            },
            // 获取历史搜索关键词
            searchkeywords: {
                match: (url) => url.includes('/?keywords'),
                handle: handleSearchKeywords
            }
        },
        defaultHandler: () => $done({})

    }
};

// 路由分发函数
function routeRequest(url, routeMap) {
    // 遍历所有主路由
    for (const routeKey in routeMap) {
        const route = routeMap[routeKey];
        // 检查URL是否匹配当前主路由
        if (route.match(url)) {
            // 如果路由包含子路由处理器
            if (route.handlers) {
                // 遍历所有子路由
                for (const subRouteKey in route.handlers) {
                    const subRoute = route.handlers[subRouteKey];
                    // 检查URL是否匹配当前子路由
                    if (subRoute.match(url)) {
                        // 执行匹配的子路由处理函数
                        return subRoute.handle();
                    }
                }
                // 如果没有匹配的子路由，使用默认处理器或返回空响应
                return route.defaultHandler ? route.defaultHandler() : $done({});
            }

            // 如果是主路由且没有子路由，直接执行主路由处理函数
            if (route.handle) {
                return route.handle();
            }
        }
    }

    // 如果没有匹配的路由，返回404
    return $done({
        status: "HTTP/1.1 404 Not Found",
        headers: { "Content-Type": "text/html" },
        body: "<h1>404 Not Found</h1>"
    });
}

// 处理函数
function handleMain() {

    const html = `<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" href="https://img.picgo.net/2025/04/24/IMG_2250359d907d7ba34f51.jpeg" type="image/x-icon">
    <link rel="apple-touch-icon" href="https://img.picgo.net/2025/04/24/IMG_2250359d907d7ba34f51.jpeg">
    <meta name="apple-mobile-web-app-title" content="VidSheep">
    <title>VidSheep</title>
    <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_4885201_i2n2iwmepf.css">
</head>
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-decoration: none;
    }

    html,
    body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        -webkit-overflow-scrolling: touch;
    }

    body {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: scroll;
        position: relative;
        height: 100vh;
        margin: 0;
        overflow: hidden;
    }

    #background {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        background-image: url('https://img.picgo.net/2025/04/11/PkKNT35Ufzvy_17070318020985ee9b67a8ea96c77.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }

    #main-container {
        width: 100%;
        min-height: 100%;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        height: calc(100vh - 50px);
        padding-bottom: 50px;
    }

    /* 底部导航栏 */
    #bottom-nav {
        padding: 10px 0;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 1000;

    }

    .nav-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999;
        width: 33.33%;
        height: 100%;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .nav-button i {
        font-size: 20px;
        margin-bottom: 4px;
    }

    .nav-button span {
        font-size: 12px;
    }

    .nav-active {
        color: #f04949;
    }

    /* 内容区域样式 */
    .content-section {
        display: none;
        width: 100%;
        padding: 100px;
        padding-bottom: 200px;
        padding: 0;
        color: #fff;
    }

    .content-section.active {
        display: block;
    }



    /* 公告 */
    .announcement {

        height: 250px;
        margin: 20% 5%;
        position: fixed;
        z-index: 999;
        padding: 20px;
        overflow: hidden;
    }

    .announcement_active {
        display: none;
    }



    .announcementButton {
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 16px;
        font-size: 14px;
        align-self: center;
        /* 按钮居中对齐 */
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }

    .math-notebook {
        /* 背景色 */
        background-image: linear-gradient(to bottom, rgba(206, 206, 206, 0.408) 5%, transparent 5%);
        background-repeat: repeat;
        background-size: 10% 20px;

        border-radius: 8px;
        /* 边角圆润 */
    }
</style>

<style>
    /* =================开始====================== */
    /* 便利贴样式，用于书写文档 */
    .stickyNotes {
        background-color: rgb(255, 255, 102);
        border-radius: 10px;
        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.8);
        /* 轻微阴影 */
        transform: rotate(5deg);
        width: 90%;
        margin-left: 0 5%;
    }

    /* 钉子 */
    .stickyNotes_nail {
        width: 20px;
        height: 20px;
        background-color: rgb(252, 89, 89);
        position: absolute;
        top: 1px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 40px;
        box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.9), inset -1px -1px 1px rgba(255, 255, 255, 1);
    }

    /* 钉子针 */
    .stickyNotes_nail_zhen {
        width: 12px;
        height: 3px;
        background-color: rgb(0, 0, 0);
        position: absolute;
        top: 20px;
        left: 50%;
        transform: rotate(60deg);
        z-index: -1;
    }

    /* ===================结束==================== */
</style>

<body>
    <div id="background"></div>
    <!-- 占顶 -->
    <div style="background-color: rgba(0, 0, 0, 0.2); height: 2%;">

    </div>

    <!-- 公告 -->
    <div class="announcement announcement_active stickyNotes math-notebook">
        <div class="stickyNotes_nail"></div>
        <div class="stickyNotes_nail_zhen"></div>
        <span style="margin-left:35%">VidSheep3.0</span>

        <ul style="margin-left:5%">
            <li>提升响应速度,更流畅的UI</li>
            <li>加入更多个性化设置</li>
            <li>解决进度条的问题</li>
            <li>解决不同设备UI适配问题</li>
            <li> <a href="https://github.com/SheepFJ/VidSheep" target="_blank">Stars</a> 支持一下作者～</li>
            <li>......</li>
            <li>......</li>
        </ul>

        <button id="announcementNO" class="announcementButton">不再提醒</button>
    </div>


    <div id="main-container">
        <!-- 占顶 -->
        <div style="background-color: rgba(0, 0, 0, 0.4); height: 6%;"></div>


        <style>
            .search-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                padding: 20px;
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                backdrop-filter: blur(5px);
            }

            .search-input {
                width: 70%;
                padding: 12px 15px;
                border: none;
                border-radius: 25px 0 0 25px;
                font-size: 16px;
                outline: none;
                background-color: rgba(255, 255, 255, 0.9);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            .search-input:focus {
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }



            .search-button {
                padding: 12px 20px;
                background: linear-gradient(135deg, #ff5e62, #ff9966);
                color: white;
                border: none;
                border-radius: 0 25px 25px 0;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }

            .search-button:hover {
                background: linear-gradient(135deg, #ff9966, #ff5e62);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }

            .recent-search {
                margin: 15px 20px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            .recent-search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-size: 14px;
                color: #666;
            }

            .recent-search-title {
                font-weight: bold;
            }

            .clear-history {
                color: #ff5e62;
                cursor: pointer;
                font-size: 12px;
            }

            .recent-keywords {
                max-height: 80px;
                overflow-y: auto;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .keyword-item {
                background-color: #f4d69c;
                border-radius: 15px;
                padding: 6px 12px;
                font-size: 12px;
                color: #333;
                display: inline-block;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .keyword-item:hover {
                background-color: #e0e0e0;
            }

            .media-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-top: 20px;

            }

            .media-card {
                background-color: rgb(255, 255, 255);
                border-radius: 10px;
                overflow: hidden;
                margin: 0 2px;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .media-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.8);
            }

            .media-image {
                width: 100%;
                height: 120px;
                object-fit: cover;
            }

            .media-title {
                padding: 5px 10px;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                color: #333;
            }
                .source-select {
                width: 40%;
                padding: 8px;
                margin: 1px 30%;
                border-radius: 20px;
                border: 1px solid #ddd;
                background-color: #ebebebf4;
                color: #5d5d5d;
                font-size: 14px;
                background-size: 16px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);

            }
        </style>
        <!-- 搜索 -->
        <div id="search-section" class="content-section active">
            <div class="search-container">
                <input type="text" placeholder="搜索影视资源..." class="search-input">
                <button class="search-button">搜索</button>

            </div>
            <select class="source-select">
                <option value="1" disabled selected>点击选择搜索源</option>
                <option value="1">数据源1</option>
                <option value="2">数据源2</option>
                <option value="3">数据源3</option>
                <option value="4">数据源4</option>
                <option value="5">数据源5</option>
            </select>

            <!-- 最近搜索关键词 -->
            <div class="recent-search">
                <div class="recent-search-header">
                    <span class="recent-search-title">搜索历史</span>
                    <span class="clear-history">删除搜索历史</span>
                </div>
                <div class="recent-keywords">
                    
                </div>
            </div>
            <!-- 搜索结果 -->
            <div class="search-results">

                <!-- 影视推荐 -->
                <div class="media-grid">
                    <div class="media-card">
                        <img src="https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg"
                            alt="小猪佩奇" class="media-image">
                        <div class="media-title">小猪佩奇</div>
                    </div>
                    <div class="media-card">
                        <img src="https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg"
                            alt="熊出没" class="media-image">
                        <div class="media-title">熊出没</div>
                    </div>
                    <div class="media-card">
                        <img src="https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg"
                            alt="海绵宝宝" class="media-image">
                        <div class="media-title">海绵宝宝</div>
                    </div>
                    <div class="media-card">
                        <img src="https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg"
                            alt="喜羊羊" class="media-image">
                        <div class="media-title">喜羊羊与灰太狼</div>
                    </div>
<div class="media-card">
                        <img src="https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg"
                            alt="小猪佩奇" class="media-image">
                        <div class="media-title">小猪佩奇</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // 获取历史搜索关键词,打开页面即执行
            fetch('https://api.sheep.com/sheep/VidSheep/api/?keywords=all')
                .then(response => response.json())
                .then(data => {
                    // 将data.data.array中的数据添加到搜索历史列表中
                    const searchHistory = document.querySelector('.recent-keywords');
                    data.data.array.forEach(keyword => {
                        searchHistory.innerHTML += \`<span class="keyword-item">\${keyword}</span>\`;
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                })

            // 删除历史记录
            const clearHistory = document.querySelector('.clear-history');
            clearHistory.addEventListener('click', () => {
                fetch('https://api.sheep.com/sheep/VidSheep/api/?keywords=clear')
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.data.information);
                        // 清空搜索历史UI
                       searchHistory.innerHTML = '';
                    })
                    .catch(error => {
                        console.error('清除历史记录失败:', error);
                    });
            });
                        

            // 搜索
            const searchInput = document.querySelector('.search-input');
            const searchButton = document.querySelector('.search-button');
            const sourceSelect = document.querySelector('.source-select');

            searchButton.addEventListener('click', () => {
                const searchWord = searchInput.value;
                const sourceValue = sourceSelect.value;


                if (searchWord.trim() !== '' && searchWord.trim().length <= 20) {
                    // 将搜索历史添加到搜索历史列表中最前
                    const searchHistory = document.querySelector('.recent-keywords');
                    searchHistory.innerHTML = \`<span class="keyword-item">\${searchWord}</span>\` + searchHistory.innerHTML;

                    //清除搜索框内容
                    searchInput.value = '';

                    // 发送搜索请求
                    fetch(\`https://api.sheep.com/sheep/VidSheep/api/?search=\${sourceValue}&searchword=\${encodeURIComponent(searchWord)}\`)
                        .then(response => response.json())
                        .then(data => {
                            console.log(data.data.information);
                            // 这里可以处理搜索结果
                        })
                        .catch(error => {
                            console.error('搜索请求出错:', error);
                        });
                }
            });

            //点击搜索历史词加入搜索框
            const searchHistory = document.querySelector('.recent-keywords');
            searchHistory.addEventListener('click', (e) => {
                // 只有当点击的是关键词元素时才将其添加到搜索框
                if (e.target.classList.contains('keyword-item')) {
                    searchInput.value = e.target.textContent;
                }
            });
        </script>
        <!-- 最近 -->
        <div id="list-section" class="content-section">
            <ul>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, ad? Perferendis in placeat
                    quas quis itaque magnam commodi, amet libero, expedita possimus unde maiores alias omnis, nihil
                    sapiente deleniti dicta!</li>
                <li>Tempore voluptate blanditiis doloribus deserunt ab omnis eaque aut incidunt illo mollitia. Deserunt,
                    obcaecati, eligendi, delectus unde totam earum dolorum nihil reiciendis nam minima nostrum facilis
                    reprehenderit ea inventore beatae!</li>
                <li>Similique inventore fuga ipsam reprehenderit aperiam, excepturi suscipit corporis quo architecto,
                    adipisci exercitationem sapiente atque magni vel perspiciatis dolorem quae quas facere deserunt!
                    Sequi magnam animi velit aperiam id repellendus!</li>
            </ul>
        </div>

        <!-- 发现 -->
        <div id="discover-section" class="content-section ">
            发现
        </div>


        <!-- 占顶 -->
        <div style="background-color: rgba(0, 0, 0, 0.4); height: 15%;">

        </div>

    </div>


    <footer>
        <div id="bottom-nav">
            <div class="nav-button nav-active" id="searchBtn" onclick="showSection('search')">
                <i class="iconfont icon-sousuo"></i>
                <span>搜索</span>
            </div>
            <div class="nav-button" id="listBtn" onclick="showSection('list')">
                <i class="iconfont icon-zuijin"></i>
                <span>最近</span>
            </div>
            <div class="nav-button" id="discoverBtn" onclick="showSection('discover')">
                <i class="iconfont icon-faxian"></i>
                <span>发现</span>
            </div>
        </div>
    </footer>



    <script>
        //api数据定义
        const announcement = ${vidSheepUserinfoData.announcement}; //1的时候显示公告,0则隐藏


        //公告是否展示
        if (announcement === 1) {
            document.querySelector(".announcement").classList.remove("announcement_active")
        }

        let currentSection = 'search';

        function showSection(section) {
            // 更新当前选中的导航按钮
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('nav-active');
            });
            document.getElementById(section + 'Btn').classList.add('nav-active');

            // 隐藏所有内容区域
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            // 显示选中的内容区域
            document.getElementById(section + '-section').classList.add('active');

            // 更新当前section
            currentSection = section;

            console.log(currentSection);

        }

        // 请求用户信息测试
        function userinfo() {
            // 向https://api.sheep.com/sheep/VidSheep/api/userinfo=all发送请求
            fetch('https://api.sheep.com/sheep/VidSheep/api/?userinfo=all')
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    document.getElementById('userinfo').innerHTML = data.data.information;
                })
                .catch(error => {
                    console.error('Error:', error);
                })
        }


        // 关闭公告
        const announcementNO = document.querySelector("#announcementNO");
        announcementNO.addEventListener("click", () => {
            document.querySelector(".announcement").classList.add("announcement_active")
            // fetch('https://api.sheep.com/sheep/VidSheep/api/?announcement=1')
            //     .then(response => response.json())
            //     .then(data => {
            //         console.log(data.data.information);
            //     })
            //     .catch(error => {
            //         console.error('Error:', error);
            //     })
        })

    </script>
</body>

</html>`;

    return $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "text/html" },
        body: html
    });
}



function handleUserInfo() {




    const urlParams = URLSearchParamsApi(url.split('?')[1]);
    const announcement = urlParams.get('announcement');

    // 关闭公告
    if (announcement) {
        vidSheepUserinfoData.announcement = 0
        storage.set("vidSheepUserinfo", vidSheepUserinfoData)
        return $done(responseStatus("成功", "不再展示公告123"));
    }


    return $done(responseStatus("成功", "用户信息获取到了"));
}


function handleSearch() {
    const urlParams = URLSearchParamsApi(url.split('?')[1])
    const searchword = urlParams.get('searchword')
    const source = urlParams.get('search') // Changed from 'source' to 'search' to match the API call

    console.log(`Search source: ${source}, Searchword: ${searchword}`);

    // 将搜索词加入vidSheepUserinfoData
    // 检查搜索词是否已存在
    const existingIndex = vidSheepUserinfoData.searchkeywords.indexOf(searchword);
    if (existingIndex !== -1) {
        // 如果存在，先从原位置删除
        vidSheepUserinfoData.searchkeywords.splice(existingIndex, 1);
    }
    // 将搜索词添加到数组最前方
    vidSheepUserinfoData.searchkeywords.unshift(searchword);
    storage.set("vidSheepUserinfo", vidSheepUserinfoData);


    // 获取搜索源
    const baseUrl = vidSheepUserinfoData.apiSources[source];
    if (!baseUrl) {
        return $done(responseStatus("失败", "不支持的搜索源"));
    }
    const requestUrl = baseUrl + encodeURIComponent(searchword);
    console.log(requestUrl + '============');

    // 使用 return 语句确保函数在获取到响应前不会继续执行
    return new Promise((resolve) => {
        // 发送搜索请求
        fetchWithCallback({
            url: requestUrl,
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
                "Accept": "application/json",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9"
            }
        }, (error, response, body) => {
            if (error) {
                resolve($done(responseStatus("失败", "搜索请求出错")));
                return;
            }

            try {
                console.log(body);
                resolve($done(responseStatus("成功", "搜索请求成功008")));
            } catch (error) {
                resolve($done(responseStatus("失败", "搜索请求失败123")));
            }
        });
    });



}



function handleSearchKeywords() {
    const urlParams = URLSearchParamsApi(url.split('?')[1])
    const keywords = urlParams.get('keywords')

    if (keywords == "all") {
        const userSearchKeywords = vidSheepUserinfoData.searchkeywords
        return $done(responseStatus("成功", userSearchKeywords, userSearchKeywords));
    }

    if (keywords == "clear") {
        vidSheepUserinfoData.searchkeywords = []
        storage.set("vidSheepUserinfo", vidSheepUserinfoData)
        return $done(responseStatus("成功", "搜索历史清空了"));
    }
}


// 启动路由分发
routeRequest(url, routeHandlers);
