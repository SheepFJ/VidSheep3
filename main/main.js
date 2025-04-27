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
                match: (url) => url.includes('/userinfo'),
                handle: handleUserInfo
            },
            // 视频列表
            videolist: {
                match: (url) => url.includes('/videolist'),
                handle: handleVideoList
            },
            // 视频播放
            videoplay: {
                match: (url) => url.includes('/videoplay'),
                handle: handleVideoPlay
            }
        },
        defaultHandler: () => $done({})
    }
};

// 路由分发函数
function routeRequest(url, routeMap) {
    for (const routeKey in routeMap) {
        const route = routeMap[routeKey];

        if (route.match(url)) {
            if (route.handlers) {
                for (const subRouteKey in route.handlers) {
                    const subRoute = route.handlers[subRouteKey];
                    if (subRoute.match(url)) {
                        return subRoute.handle();
                    }
                }
                return route.defaultHandler ? route.defaultHandler() : $done({});
            }

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
    }

    .content-section.active {
        display: block;
    }

#search-section{
        background-color: #000;
        color: #fff;
    }
</style>

<body>
    <div id="background" style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: -1;
      background-image: url('https://img.picgo.net/2025/04/11/GsWwJ8qQUAqD_1740639963384332315e3baafa765.jpeg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    "></div>

    <div id="main-container">
        <div id="search-section" class="content-section active" onclick="userinfo()">
            搜索
            <span id="userinfo"></span>
        </div>

        <div id="list-section" class="content-section">
            最近
        </div>

        <div id="discover-section" class="content-section">
            发现
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
        }


       function userinfo() {
            // 向https://api.sheep.com/sheep/VidSheep/api/userinfo=all发送请求
            fetch('https://api.sheep.com/sheep/VidSheep/api/userinfo=all')
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    document.getElementById('userinfo').innerHTML = data.data.userinfo.username;
                })
                .catch(error => {
                    console.error('Error:', error);
                })
        }
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
    return $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: true,
            data: {
                userinfo: {
                    id: 1,
                    username: "我是jjc，别人都叫我jjc大雷，可能我雷比较大",
                    email: "test@test.com",
                    avatar: "https://example.com/avatar.jpg",
                    created_at: "2024-01-01 00:00:00"
                }
            }
        })
    });
}

function handleVideoList() {
    return $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: true,
            data: {
                videolist: []
            }
        })
    });
}

function handleVideoPlay() {
    return $done({
        status: "HTTP/1.1 200 OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            success: true,
            data: {
                videoplay: {}
            }
        })
    });
}

// 启动路由分发
routeRequest(url, routeHandlers);
