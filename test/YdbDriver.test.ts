import {StartedTestContainer} from "testcontainers";
import {YdbDriver} from "../src";
import {YdbDbRunner} from "./runner";

describe('YdbDriver', () => {
    let container: StartedTestContainer;
    let driver: YdbDriver;

    beforeAll(async () => {
        container = await YdbDbRunner.startContainer({});
        driver = new YdbDriver({
            database: "local",
            endpoint: `grpc://${container.getHost()}:${container.getMappedPort(2136)}`
        });
    });

})