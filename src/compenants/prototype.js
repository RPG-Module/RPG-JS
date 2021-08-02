Array.prototype.remove = function(strings) {
    while (this.indexOf(strings) !== -1) {
        this.splice(this.indexOf(strings), 1);
    }
    return this
}