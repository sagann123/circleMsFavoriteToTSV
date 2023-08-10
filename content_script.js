function extractFavoriteList() {
    let resultList = [];
    // ページ内の各お気に入りサークルの情報を抽出する
    document.querySelectorAll(".tablefavcolumn").forEach(
        e => {
            let record = {};
            record.location = e.querySelector("span[data-bind='text: Location']").innerText;
            record.genre = e.querySelector("td[data-bind='text: Genre']").innerText;
            record.circleName = e.querySelector("td.circlename span").innerText;
            record.author = e.querySelector("div.writer_name").innerText;
            record.checkedColor = e.querySelector("div.m-colorbox input[type='radio']:checked").value;
            record.memo = e.querySelector("td.memo span").innerText;
            resultList.push(record);
        });
    return resultList;
}

function downloadTSV(faroriteList) {
    const tsvData = makeTSV(favoriteList);

    const tsvBlob = new Blob([tsvData], {type: "text/tab-separated-values"});
    const url = URL.createObjectURL(tsvBlob);

    // 表示のダウンロード用リンクを作成し、クリックする
    let aElem = document.createElement("a");
    aElem.style = "display: none";
    aElem.href = url;
    aElem.download = "favorite.tsv";
    document.body.appendChild(aElem);

    aElem.click();
}

function makeTSV(favoriteList) {
    if (!favoriteList || favoriteList.length === 0) {
        return;
    }

    // 見出し行
    const keys = Object.keys(favoriteList[0]);
    const header = keys.join("\t");

    // 各行の項目をタブで結合し、各行を改行で結合する
    const body = favoriteList.map(record => {
        let values = keys.map(key => {return record[key]})
        return values.join("\t");
    }).join("\n");

    return [header, body].join("\n");
}

// ２ページ目以降お気に入りリスト部分の描画完了で処理を行う
const observerPaging = new MutationObserver(mutationRecords => {
    if (document.querySelector(".tablefavcolumn")) {
        favoriteList = favoriteList.concat(extractFavoriteList());

        const buttonNext = document.querySelector("div#main > div.left div.pagination > div.pagination_area > ul > li:nth-child(8) > a");
        if (!buttonNext.parentElement.classList.contains("disabled")) {
            // 次ページボタンが有効な場合は次ページに遷移してリストを追加取得する
            buttonNext.click();
        } else {
            observerPaging.disconnect();
            downloadTSV(favoriteList);
            // １ページ目に戻る
            document.querySelector("div#main > div.left div.pagination > div.pagination_area > ul > li:nth-child(1) > a").click();
        }
    }
});

let favoriteList = [];
function startFavoriteToTsv() {
    if (window.location.hash !== "#/v=3") {
        alert("１ページ目で実行してください。");
        return;
    }

    favoriteList = extractFavoriteList();

    const buttonNext = document.querySelector("div#main > div.left div.pagination > div.pagination_area > ul > li:nth-child(8) > a");
    if (!buttonNext.parentElement.classList.contains("disabled")) {
        // 次ページボタンが有効な場合は次ページに遷移してリストを追加取得する
        observerPaging.observe(document.querySelector("div#main div.left"), {childList: true});
        buttonNext.click();
    } else {
        // 次ページなしのため、現在のリストでダウンロード実行
        downloadTSV(favoriteList);  
    }
}

function appendButtonDownload() {
    let buttonDownload = document.createElement("button");
    buttonDownload.type = "button";
    buttonDownload.innerText = "TSVダウンロード";
    buttonDownload.style = "margin-left: 1em; margin-top: 1em;";
    buttonDownload.className = "DownloadButton"
    buttonDownload.addEventListener("click", startFavoriteToTsv, false);
    document.querySelector("div.favo_mrgauto").appendChild(buttonDownload);
}

// お気に入りページの場合にダウンロードボタン追加
if (window.location.hash.startsWith("#/v=3")) {
    appendButtonDownload();
}