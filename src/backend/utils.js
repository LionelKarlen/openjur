export function formatDate(epoch) {
    let date = new Date(epoch * 1000);
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
}

export function pickerFormat(val) {
    if (!val) return '';
    let x = val.split('-');
    let date = new Date(x[0], x[1] - 1, x[2]).getTime() / 1000;
    return formatDate(date);
}

export function generateID() {
    return Math.round(new Date(Date.now()).valueOf() / 100);
}

export function safeRound(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function getLastname(str) {
    let pieces = str.split(' ');
    let lastname = pieces[pieces.length - 1];
    return lastname;
}

export function sortByName(a, b) {
    let aLastname = getLastname(a.Name).toLowerCase();
    let bLastname = getLastname(b.Name).toLowerCase();
    if (aLastname < bLastname) {
        return -1;
    }
    if (aLastname > bLastname) {
        return 1;
    }
    return 0;
}
