import { Sensor, SensorValue, Enums, Helpers } from 'jvsveml6070';

async function readMultiple() {
    try {
        const sensor = await Sensor.initialize(),
            readDelay = 1000 - sensor.getRefreshTime();

        for (let i = 0; i < 10; i++) {
            output(await sensor.read());
            await Helpers.delay(readDelay);
        }

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

readMultiple();
