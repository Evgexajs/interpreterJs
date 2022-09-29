import {
    firstLineTest,
    endProgramTest,
    startProgramTest,
    read,
    show,
    arithmetic,
    cycle,
    endWhile
} from "@/scripts/interpreter/constants";

export class Interpreter {
    numbers = new Map([
        ['0', 0],
        ['1', 1],
        ['2', 2],
        ['3', 3]
    ]);
    vars = new Map();
    isOk;
    nameProgram = '';
    arrayText = [];

    getData(data) {
        this.arrayText = [];
        this.isOk = true;
        const text = data;
        const arrayText = text.split(';');

        for (let i = 0; i < arrayText.length; i++) {
            if (arrayText[i] !== '') {
                this.arrayText.push(arrayText[i].trim());
            }
        }

        return this._todoProgram();
    }

    _todoProgram() {
        if (this._initializeProgram()) {
            //первая строка может быть баганая пришлось сделать костыль(
            this.arrayText[0] = this._cleanOperation(this.arrayText[0]);
            console.log(this.arrayText)

            //цикл операций)
            for (let i = 0; i < this.arrayText.length; i++) {
                const res = this._selectOperation(this.arrayText[i], i);
                if (res === false) {
                    return false;
                }
                if (+res) {
                    i = res;
                }
            }
        }
    }

    _selectOperation(operation, i) {
        if (cycle.test(operation)) {
            return this._cycle(operation, i);
        } else if (arithmetic.test(operation)) {
            return this._arithmetic(operation);
        } else if (show.test(operation)) {
            return this._show(operation);
        } else if (read.test(operation)) {
            //TO DO
        } else {
            return this._showError('Неправильно задан оператор:' + operation);
        }
    }

    _cycle(text, index) {
        let lastIndex;
        for (let i = index; i < this.arrayText.length; i++) {
            if (endWhile.test(this.arrayText[i])) {
                lastIndex = i;
            }
        }
        if (!lastIndex) return false;

        const data = this._cleanOperation(text);
        let condition = data.split('do begin')[0]
            .replace('while', '').replaceAll(' ', '');
        const firstOperation = data.split('do begin')[1].replaceAll(' ', '');

        while (this._conditionWhile(condition)) {
            this._selectOperation(firstOperation);
            for (let i = index + 1; i < lastIndex; i++) {
                this._selectOperation(this.arrayText[i]);
            }
        }
        for (let i = index; i < lastIndex + 1; i++) {
            delete this.arrayText[i];
        }
        return lastIndex;
    }

    _conditionWhile(text) {
        let znak;
        //определить операцию
        if (/</.test(text)) {
            znak = '<';
        } else if (/>/.test(text)) {
            znak = '>';
        } else if (/=/.test(text)) {
            znak = '=';
        } else {
            this._showError('Неверный знак сравнения: ' + text);
            return false;
        }

        let operationRight = text.split(znak)[0];
        let operationLeft = text.split(znak)[1];

        if (this.vars.has(operationRight)) {
            operationRight = this.vars.get(operationRight);
        }
        if (this.vars.has(operationLeft)) {
            operationLeft = this.vars.get(operationLeft);
        }

        return this._math_it_up[znak](operationRight, operationLeft, this);
    }

    _show(operation) {
        const textInside = operation.replace('writeln(', '').replace(')', '');

        if (/'/.test(operation)) {
            this._showMessage(textInside.replaceAll("'", ''));
        } else if (/"/.test(operation)) {
            this._showMessage(textInside.replaceAll('"', ''));
        } else {
            if (this.vars.has(textInside)) {
                this._showMessage(this.vars.get(textInside));
            } else {
                this._showMessage('Неверный оператор вывода: ' + operation);
                return false;
            }
        }
    }

    _arithmetic(text) {
        const operation = this._cleanString(text);
        const operationArr = operation.split(':=');

        const varGet = operationArr[0];
        if (!this.vars.has(varGet)) {
            this._showError('Нет указываемой переменной присвоения: ' + operation);
            return false;
        }


        let znak;
        //определить операцию
        if (/\+/.test(operationArr[1])) {
            znak = '+';
        } else if (/-/.test(operationArr[1])) {
            znak = '-';
        } else if (/\*/.test(operationArr[1])) {
            znak = '*';
        } else if (/\//.test(operationArr[1])) {
            znak = '/';
        } else {
            if (this.vars.has(operationArr[1])) {
                this.vars.set(varGet, this.vars.has(operationArr[1]));
            } else {
                const variable = this._convertNumber(operationArr[1]).from(4).to(10);

                if (isNaN(variable)) {
                    this._showError('число не четвиричной системы: ' + variable);
                    return false;
                }
                this.vars.set(varGet, variable);
            }
            return;
            // this._showError('Неверный знак операции: ' + operation);
            // return false;
        }

        let operationRight = operationArr[1].split(znak)[0];
        let operationLeft = operationArr[1].split(znak)[1];

        if (this.vars.has(operationRight)) {
            operationRight = this.vars.get(operationRight);
        }
        if (this.vars.has(operationLeft)) {
            operationLeft = this.vars.get(operationLeft);
        }

        const result = this._math_it_up[znak](operationRight, operationLeft, this);
        if (result === false) {
            return false;
        }
        this.vars.set(varGet, result);
    }

    _math_it_up = {
        '+': function (x, y, _this) {
            if (x >= 4 || y >= 4) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            }
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) + parseInt(_y, 10);
            return _this._convertNumber(result).from(10).to(4);
        },
        '-': function (x, y, _this) {
            if (x >= 4 || y >= 4) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            }
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) - parseInt(_y, 10);
            return _this._convertNumber(result).from(10).to(4);
        },
        '/': function (x, y, _this) {
            if (x >= 4 || y >= 4) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            }
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) / parseInt(_y, 10);
            return _this._convertNumber(result).from(10).to(4);
        },
        '*': function (x, y, _this) {
            if (x >= 4 || y >= 4) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            }
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) * parseInt(_y, 10);
            return _this._convertNumber(result).from(10).to(4);
        },
        '>': function (x, y, _this) {
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) > parseInt(_y, 10);
            return result;
        },
        '<': function (x, y, _this) {
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) < parseInt(_y, 10);
            return result;
        },
        '=': function (x, y, _this) {
            const _x = _this._convertNumber(x).from(4).to(10);
            const _y = _this._convertNumber(y).from(4).to(10);

            if (isNaN(_x)) {
                _this._showError('число не четвиричной системы: ' + x);
                return false;
            } else if (isNaN(_y)) {
                _this._showError('число не четвиричной системы: ' + y);
                return false;
            }

            const result = parseInt(_x, 10) === parseInt(_y, 10);
            return result;
        },
    };

    _initializeProgram() {
        const firstLine = this.arrayText[0];
        if (firstLineTest.test(firstLine)) {
            this.nameProgram = firstLine.split(' ')[1];
            delete this.arrayText[0];

            const varsString = this._cleanString(this.arrayText[1]);
            this._setVars(varsString);
            delete this.arrayText[1];

            this.arrayText = this._reloadArray(this.arrayText);

            return this._checkMain();
        } else {
            this._showError('Первая строка неверна пример: program <myProg>;');
        }
    }

    _checkMain() {
        const startProgram = this.arrayText[0];
        const endProgram = this.arrayText[this.arrayText.length - 1];

        if (startProgramTest.test(startProgram) &&  endProgramTest.test(endProgram)) {
            this.arrayText[0] = this.arrayText[0].replace('begin', '');
            this.arrayText[this.arrayText.length - 1] = this.arrayText[this.arrayText.length - 1].replace('end.', '');
            this.arrayText = this._reloadArray(this.arrayText);
            return true;
        } else if (!endProgramTest.test(endProgram)) {
            this._showError('Последняя строка неверна');
            return false;
        } else if (!startProgramTest.test(startProgram)) {
            this._showError('Нет условия begin для начала работы');
            return false;
        }
    }

    _setVars(text) {
        let vars = text.replace('var', '').replace(':integer', '').split(',');
        vars.forEach(el => {
            this.vars.set(el, '');
        })
    }

    _cleanString(text) {
        return text.replaceAll(/\s/g,'');
    }

    _reloadArray(array) {
        return array.reduce((all, el) => {
            if (el !== undefined && el !== '') {
                all.push(el);
            }
            return all
        }, [])
    }

    _showError(message) {
        alert(message);
    }

    _showMessage(message) {
        alert(message);
    }

    _cleanOperation(text) {
        let flag = false;
        let operation = '';
        const temp = text.replace('\n', '');
        for (let i = 0; i < temp.length; i++) {
            if (temp.charAt(i) !== ' ') {
                flag = true;
            }
            if (flag) {
                operation += temp.charAt(i);
            }
        }
        return operation;
    }

    _convertNumber = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                    }
                };
            }
        };
    };

    optimize() {
        //how dop question
    }
}
