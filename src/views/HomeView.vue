<template>
    <div>
        <div>
            <div>Введите код на Pascal</div>
            <p>
                <textarea rows="10" cols="70" name="text"
                          :value="data" @input="event => this.data = event.target.value"></textarea>
            </p>
        </div>
        <div>
            <button v-on:click="check">Выполнить</button>
        </div>
    </div>
</template>

<script>
import {Interpreter} from "@/scripts/interpreter/main";

export default {
    name: 'HomeView',
    components: {},
    data() {
        return {
            interpreter: new Interpreter(),
            data: 'program HelloWorld;\n' +
                  'var\n' + '    s,n:integer;\n' +
                  'begin\n' +
                  '    s := 1 + 1;\n' +
                  '    s := 1 + 1;\n' +
                  '    writeln(\'Привет Мир!\');\n' +
                  '    while s < 100 do begin\n' +
                  '        s := s + 12;\n' +
                  '        writeln(s);\n' +
                  '    end;\n' +
                  '    writeln(s);\n' +
                  '    writeln(\'конец программы\');\n' +
                  'end.'
        }
    },
    methods: {
        check: function () {
            this.interpreter.getData(this.data);
        }
    }

}
</script>

<style>
textarea {
    resize: none;
}
</style>
