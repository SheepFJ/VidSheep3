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
function responseStatus(success, data) {
    return {
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: `${success}`,
            data: {
                information: `${data}`
            }
        })
    }
}

//用户数据定义
let vidSheepUserinfo = {
    BGimage: "", // 图片地址
    BG_brightness: "", //背景明度
    auto_change_BG: true, //自动更换壁纸,24小时更换一次   
    current_timestamp: 0, //当前时间戳
    old_timestamp: 0, //上次更换时间戳
    default_source: 2, //默认壁纸来源
    announcement: 1, //	用于是否展示公告
    initialization: false //f表示未初始化,t表示已初始化
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
// 最近数据定义
let vidSheepRecent = {

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
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: -1;
      background-image: url('https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg');
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



    .faxianlist {
        margin: 10% 5%;
        height: 50px;
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

<body>
    <div id="background"></div>

    <!-- 公告 -->
    <div class="announcement announcement_active stickyNotes math-notebook">
        <div class="stickyNotes_nail"></div>
        <div class="stickyNotes_nail_zhen"></div>
        <span style="margin-left:35%" >VidSheep3.0</span>

<ul style="margin-left:5%">

<li>提升响应速度,更流畅的UI</li>
<li>加入更多个性化设置</li>
<li>解决进度条的问题</li>
<li>解决不同设备UI适配问题</li>
<li>......</li>
<li>......</li>
<li>......</li>


</ul>
        <button id="announcementNO" class="announcementButton" >不再提醒</button>
    </div>


    <div id="main-container">
        <div id="search-section" class="content-section active" onclick="userinfo() ">
            搜索
           
        </div>

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

        <div id="discover-section" class="content-section ">
            <div class="stickyNotes faxianlist">
                <div class="stickyNotes_nail"></div>
                更换壁纸111111111
            </div>
            <div class="stickyNotes faxianlist">
                <div class="stickyNotes_nail"></div>
                更换色彩222222
            </div>
            <div class="stickyNotes faxianlist">
                <div class="stickyNotes_nail"></div>
                我不知道33333333
            </div>
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
    const urlParams = new URLSearchParams(url.split('?')[1])
    const announcement = urlParams.get('announcement')

    // 关闭公告
    if (announcement) {
        vidSheepUserinfoData.announcement = 0
        storage.set("vidSheepUserinfo", vidSheepUserinfoData)
        return $done(responseStatus("成功", "不再展示公告"));
    }


    return $done(responseStatus("成功", "搜索点击响应了"));
}



// 启动路由分发
routeRequest(url, routeHandlers);
