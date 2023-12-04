const core = require('./../../sub_programs/core');
const event_emitter = require('events').EventEmitter;

const count_output_event = new event_emitter();
const string_test = /^[0-9]+$/;

module.exports = {
    count_output_event,

    count_function: (id, number) => {
        console.log(id);
        if (!string_test.test(number)) return;
        number = parseInt(number);
        // Read the count json
        const count_json = core.JSON_read(__dirname + './../../../json/count.json');
        // Then parse the input we have.
        count_json.then((value) => {
            if (value === null) {
                count_output_event.emit('critical_error');
                return;
            }

            if (number != value.next_number || id === value.user_id) {
                value.next_number = 1;
                value.current_number = 0;
                value.user_id = '';

                core.JSON_write(__dirname + './../../../json/count.json', value);
                count_output_event.emit('fail');
                return;
            } else {
                // Update the count.json to the next values
                value.next_number += 1;
                value.current_number += 1;
                value.user_id = id;

                if (number > value.high_score) {
                    value.high_score = number;
                }

                // Sync the json file
                core.JSON_write(__dirname + './../../../json/count.json', value);

                if (number === 69) {
                    count_output_event.emit('success_special_69');
                } else if (number === 100) {
                        count_output_event.emit('success_special_100');
                }

                count_output_event.emit('success');
            }

        });
    },
};