import {StartedDockerComposeEnvironment, StartedTestContainer} from "testcontainers";
import {YdbDriver} from "../src";
import {YdbRunner} from "./runner";
jest.setTimeout(100_000);

describe('YdbDriver', () => {
    let container: StartedTestContainer;
    let environment: StartedDockerComposeEnvironment;
    let driver: YdbDriver;

    beforeAll(async () => {
        const env = await YdbRunner.getTestingEnvironment();
        container = env.container;
        environment = env.composeEnvironment;
        driver = new YdbDriver({
            database: "local",
            endpoint: `grpc://${container.getHost()}:${container.getMappedPort(2136)}`
        });
        await driver.query("SELECT 1;");
    });

    afterAll(async() => {
        await container.stop();
        await environment.stop();
    });

    test('alive', async() => {
        let data = await driver.query("SELECT 1 as test");
        expect(data).toEqual([
            {
                name: 1
            }
        ]);
    });

})