const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');
const { glob } = require('glob'); // globをインポート

// スクリプトの実行方法: node remove-mobirise-img.js <target_directory>

const targetDirectory = process.argv[2];

if (!targetDirectory) {
    console.error('エラー: 処理対象のディレクトリを指定してください。');
    console.error('例: node remove-mobirise-img.js ./path/to/your/html_files');
    process.exit(1);
}

// HTMLファイルを処理する関数
async function processHtmlFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) {
                console.error(`エラー: ファイル '${filePath}' の読み込みに失敗しました。`, err);
                return reject(err);
            }

            const $ = cheerio.load(html);

            // // 特定の<img>タグを検索して削除
            // // Mobiriseが追加する余計なimgタグの特定パターンに基づいています。
            // // 必要に応じてセレクタを調整してください。
            // $('img[alt=""][style="height: 4rem"][src^="data:image/gif;base64"]').remove();

            // Mobiriseのクレジット表記<section>を削除
            // class="display-7" かつ style属性に"height: 4rem"を含む<section>を削除
            $('section.display-7[style*="height: 4rem"]').remove();

            // 変更されたHTMLを取得
            const cleanedHtml = $.html();

            fs.writeFile(filePath, cleanedHtml, 'utf8', (err) => {
                if (err) {
                    console.error(`エラー: ファイル '${filePath}' への書き込みに失敗しました。`, err);
                    return reject(err);
                }
                console.log(`✅ '${filePath}' から不要な <img> タグが除去されました。`);
                resolve();
            });
        });
    });
}

async function main() {
    try {
        // 指定されたディレクトリとそのサブディレクトリ内のすべての.htmlファイルを取得
        const htmlFiles = await glob(`${targetDirectory}/**/*.html`, { nodir: true });

        if (htmlFiles.length === 0) {
            console.warn(`警告: 指定されたディレクトリ '${targetDirectory}' にHTMLファイルが見つかりませんでした。`);
            return;
        }

        console.log(`以下のHTMLファイルから不要な <img> タグを除去します:\n${htmlFiles.join('\n')}\n`);

        // 各HTMLファイルを非同期で処理
        await Promise.all(htmlFiles.map(file => processHtmlFile(file)));

        console.log('\nすべてのHTMLファイルの処理が完了しました。');
    } catch (error) {
        console.error('処理中にエラーが発生しました:', error);
        process.exit(1);
    }
}

main();