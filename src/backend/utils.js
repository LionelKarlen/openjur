export function formatDate(epoch) {
    let date = new Date(epoch * 1000);
    return `${date.getDate()}. ${date.getMonth() + 1} ${date.getFullYear()}`;
}

export function generateID() {
    return Math.round(new Date(Date.now()).valueOf() / 100);
}

export function sortByName(a, b) {
    if (a.Name < b.Name) {
        return -1;
    }
    if (a.Name > b.Name) {
        return 1;
    }
    return 0;
}
