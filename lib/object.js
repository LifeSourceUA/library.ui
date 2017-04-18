export const flatten = (ob) => {
    return Object.keys(ob).reduce(function(toReturn, k) {
        if (Object.prototype.toString.call(ob[k]) === '[object Date]') {
            toReturn[k] = ob[k].toString();
        }
        else if ((typeof ob[k]) === 'object' && ob[k]) {
            const flatObject = flatten(ob[k]);
            Object.keys(flatObject).forEach(function(k2) {
                toReturn[k + '.' + k2] = flatObject[k2];
            });
        }
        else {
            toReturn[k] = ob[k];
        }

        return toReturn;
    }, {});
};

export const unflatten = (data) => {
    if (Object(data) !== data || Array.isArray(data)) {
        return data;
    }

    const regex = /\.?([^.\[\]]+)$|\[(\d+)]$/;
    const props = Object.keys(data);
    let result = '';
    let p;
    while(p = props.shift()) {
        const m = regex.exec(p);
        let target;
        if (m.index) {
            const rest = p.slice(0, m.index);
            if (!(rest in data)) {
                data[rest] = m[2] ? [] : {};
                props.push(rest);
            }
            target = data[rest];
        } else {
            target = result || (result = (m[2] ? [] : {}));
        }
        target[m[2] || m[1]] = data[p];
    }
    return result;
};