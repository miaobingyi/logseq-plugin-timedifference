import "@logseq/libs"

async function insertCurrentTimeOrCalculateInterval() {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (!currentBlock) {
        logseq.App.showMsg('No block selected.');
        return;
    }

    const currentTime = new Date();
    const currentHours = currentTime.getHours().toString().padStart(2, '0');
    const currentMinutes = currentTime.getMinutes().toString().padStart(2, '0');
    const formattedCurrentTime = `${currentHours}:${currentMinutes}`;

    // 更新正则表达式以忽略时间格式中的空格
    const fullPattern = /^(\d{2})\s*[:：]\s*(\d{2})\s*-\s*(\d{2})\s*[:：]\s*(\d{2})$/;
    const startPattern = /^(\d{2})\s*[:：]\s*(\d{2})$/;
    const startWithDashPattern = /^(\d{2})\s*[:：]\s*(\d{2})\s*-\s*$/;

    let updatedContent = currentBlock.content.trim();

    if (fullPattern.test(updatedContent)) {
        // 已有开始和结束时间，重新计算间隔
        let [_, startHour, startMinute, endHour, endMinute] = updatedContent.match(fullPattern);
        let interval = calculateInterval(startHour, startMinute, endHour, endMinute);
        updatedContent += ` ${interval}`;
        logseq.App.showMsg('检测到开始和结束时间戳，计算时间间隔');
    } else if (startWithDashPattern.test(updatedContent)) {
        // 开始时间后直接跟随一个破折号，插入当前时间和间隔
        let [_, startHour, startMinute] = updatedContent.match(startWithDashPattern);
        let interval = calculateInterval(startHour, startMinute, currentHours, currentMinutes);
        updatedContent += `${formattedCurrentTime} ${interval}`;
        logseq.App.showMsg('检测到开始时间戳，插入当前时间戳并计算时间间隔');
    } else if (startPattern.test(updatedContent)) {
        // 仅有开始时间，添加破折号和当前时间，再加上间隔
        let [_, startHour, startMinute] = updatedContent.match(startPattern);
        let interval = calculateInterval(startHour, startMinute, currentHours, currentMinutes);
        updatedContent += ` - ${formattedCurrentTime} ${interval}`;
        logseq.App.showMsg('检测到开始时间戳，插入当前时间戳并计算时间间隔');
    } else {
        // 空白或其他内容，直接插入当前时间
        updatedContent = formattedCurrentTime;
        logseq.App.showMsg('判断为空白Block，插入当前时间戳');
    }

    await logseq.Editor.updateBlock(currentBlock.uuid, updatedContent);
}

function calculateInterval(startHour, startMinute, endHour, endMinute) {
    const start = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
    const end = parseInt(endHour, 10) * 60 + parseInt(endMinute, 10);
    const diff = end - start;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours} h ${minutes} mins`;
}

function main() {
    console.log("Time Insertion & Interval Calculation plugin loaded");
    logseq.Editor.registerSlashCommand('cc', insertCurrentTimeOrCalculateInterval);
}

logseq.ready(main).catch(console.error);
