class df {
  constructor() {
    this.what = true;
  }

  get(obj, kwarg) {
    const return_ = [];
    Array(Object.keys(kwarg)).forEach((item) => {
      if (obj[item] == null) {
        return false;
      }
      return_.push(obj[item]);
    })
    return return_.length === 0 ? false : return_
  }

  remove(obj, name) {
    try {
      delete obj[name];
    } catch {
      return null
    }
  }
}

module.exports = new df()
