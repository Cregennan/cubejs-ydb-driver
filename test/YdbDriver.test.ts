import {StartedDockerComposeEnvironment, StartedTestContainer} from "testcontainers";
import {YdbDriver} from "../src";
import {YdbRunner} from "./runner";
jest.setTimeout(100_000);

describe('YdbDriver', () => {
    let container: StartedTestContainer;
    let environment: StartedDockerComposeEnvironment;
    let driver: YdbDriver;

    beforeAll(async () => {
        process.env.YDB_ANONYMOUS_CREDENTIALS = '1';
        process.env.TESTCONTAINERS_HOST_OVERRIDE="127.0.0.1";

        const env = await YdbRunner.getTestingEnvironment();

        container = env.container;
        environment = env.composeEnvironment;
        driver = new YdbDriver({
            database: "local",
            endpoint: `grpc://${container.getHost()}:${container.getMappedPort(2136)}`
        });
        await driver.ready();
        await driver.testConnection();
    });

    afterAll(async () => {
        if (driver)
            await driver.release();
        if (container)
            await container.stop();
        if (environment)
            await environment.stop();
    });

    test('alive', async() => {
        let data = await driver.query("SELECT 1 as test");
        expect(data).toEqual([
            {
                test: "1"
            }
        ]);
    });

})