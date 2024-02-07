import "@logseq/libs"

async function calculateAndInsertTimeInterval() {
    // 获取当前选中的块
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (!currentBlock) {
        logseq.App.showMsg('No block selected.');
        return;
    }
    // 移除字符串中的所有空格
    const contentWithoutSpaces = currentBlock.content.replace(/\s+/g, '');

    // 使用正则表达式解析时间范围，支持全角和半角冒号
    const timeRangeRegex = /(\d{1,2})[:：](\d{2})-(\d{1,2})[:：](\d{2})/;
    const match = contentWithoutSpaces.match(timeRangeRegex);
    if (match) {
        const startTimeHours = parseInt(match[1], 10);
        const startTimeMinutes = parseInt(match[2], 10);
        const endTimeHours = parseInt(match[3], 10);
        const endTimeMinutes = parseInt(match[4], 10);

        // 计算时间差
        const startMinutes = startTimeHours * 60 + startTimeMinutes;
        const endMinutes = endTimeHours * 60 + endTimeMinutes;
        const diffMinutes = endMinutes - startMinutes;

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        const timeIntervalText = `     ${hours} h ${minutes} mins`;

        // 更新当前block内容，追加时间间隔
        const updatedContent = `${currentBlock.content} ${timeIntervalText}`;
        await logseq.Editor.updateBlock(currentBlock.uuid, updatedContent);
    } else {
        logseq.App.showMsg('Please ensure the block contains a time range in the format HH:MM-HH:MM.');
    }
}

function main() {
    console.log("Time Difference plugin loaded");

    // 注册斜杠命令 /cc
    logseq.Editor.registerSlashCommand('cc', calculateAndInsertTimeInterval);
}

logseq.ready(main).catch(console.error);
