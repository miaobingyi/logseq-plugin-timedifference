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

    // 检测当前块内容是否为空或仅包含空格
    if (!currentBlock.content.trim()) {
        await logseq.Editor.updateBlock(currentBlock.uuid, formattedCurrentTime);
    } else {
        // 尝试匹配HH:MM格式的时间，考虑空格和全角/半角冒号
        const timeRegex = /(\d{1,2})\s*[:：]\s*(\d{2})$/;
        const match = currentBlock.content.match(timeRegex);

        if (match) {
            const startTimeHours = parseInt(match[1], 10);
            const startTimeMinutes = parseInt(match[2], 10);
            const startMinutes = startTimeHours * 60 + startTimeMinutes;
            const endMinutes = currentHours * 60 + parseInt(currentMinutes, 10);
            const diffMinutes = endMinutes - startMinutes;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            const timeIntervalText = ` - ${formattedCurrentTime}    ${hours} h ${minutes} mins`;
            const updatedContent = `${currentBlock.content}${timeIntervalText}`;
            await logseq.Editor.updateBlock(currentBlock.uuid, updatedContent);
        } else {
            await logseq.Editor.updateBlock(currentBlock.uuid, `${currentBlock.content} ${formattedCurrentTime}`);
        }
    }
}

function main() {
    console.log("Time Insertion & Interval Calculation plugin loaded");

    // 注册斜杠命令，比如 /cc
    logseq.Editor.registerSlashCommand('cc', insertCurrentTimeOrCalculateInterval);
}

logseq.ready(main).catch(console.error);
