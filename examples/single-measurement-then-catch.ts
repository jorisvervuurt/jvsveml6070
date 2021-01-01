import { Sensor, SensorValue, Enums } from 'jvsveml6070';

Sensor.initialize()
    .then((sensor) => {
        sensor.read()
            .then((value) => output(value))
            .finally(() => sensor.disable());
    })
    .catch((error) => console.error(error));

function output(value: SensorValue) {
    let output = `Raw = ${value.rawValue}`;
    output += `, Normalized = ${value.normalizedValue}`;
    output += `, UV index = ${value.uvIndex.value}`;
    output += `, UV index risk level = ${Enums.UvIndexRiskLevel[value.uvIndex.riskLevel]}`;

    console.log(output);
}
