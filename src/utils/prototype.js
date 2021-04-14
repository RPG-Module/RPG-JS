Array.prototype.remove = function(strings) {
    let found = this.indexOf(strings);

    while (this.indexOf(strings) !== -1) {
        this.splice(this.indexOf(strings), 1);
    }
    return this
}