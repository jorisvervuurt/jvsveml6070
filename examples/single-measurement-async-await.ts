import { Sensor, SensorValue, Enums } from 'jvsveml6070';

async function read() {
    try {
        const sensor = await Sensor.initialize();

        output(await sensor.read());

        await sensor.disable();
    } catch (error) {
        console.error(error);
    }
}

function output(value: SensorValue) {
    let output = `Raw = ${value.rawValue}`;
    output += `, Normalized = ${value.normalizedValue}`;
    output += `, UV index = ${value.uvIndex.value}`;
    output += `, UV index risk level = ${Enums.UvIndexRiskLevel[value.uvIndex.riskLevel]}`;

    console.log(output);
}

read();
