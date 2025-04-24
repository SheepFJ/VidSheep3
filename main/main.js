console.log(111)

const html = `<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
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
        /* 传统方式 */
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
        height: 100vh;

    }


    /* 底部导航栏 */
    #bottom-nav {
        position: fixed;
        bottom: 0px;
        height: env(safe-area-inset-bottom);
        width: 100%;
        height: 50px;
        background: rgba(0, 0, 0, 0.8);
        pointer-events: none;
        color: green;
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
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>

        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>

        <button class="refresh-btn" onclick="window.location.reload()">刷新页面</button>


        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <div style="background-color:red;">kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk</div>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>

        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqwwwwwwwqqqqqqqq</h1>
        <h1>qqqqqqqqqqqqqqqqqqqqqq</h1>

    </div>

    <footer>
        <div id="bottom-nav">
            <div class="nav-button" id="searchBtn" onclick="showSearch()">
                <i class="iconfont icon-sousuo"></i>
                <span>搜索</span>
            </div>
            <div class="nav-button" id="listBtn" onclick="showList()">
                <i class="iconfont icon-zuijin"></i>
                <span>最近</span>
            </div>
            <div class="nav-button nav-active" id="disCover" onclick="disCover()">
                <i class="iconfont icon-faxian"></i>
                <span>发现</span>
            </div>
        </div>
    </footer>
</body>

</html>`;

$done({
    status: "HTTP/1.1 200 OK",
    headers: { "Content-Type": "text/html" },
    body: html
});
