import {
    DbRunnerAbstract,
    DBRunnerContainerOptions
} from "@cubejs-backend/testing-shared/dist/src/db-container-runners/db-runner.abstract";
import {
    BoundPorts,
    DockerComposeEnvironment,
    GenericContainer,
    StartedDockerComposeEnvironment,
    Wait,
    WaitStrategy
} from "testcontainers";
import {StartedGenericContainer} from "testcontainers/build/generic-container/started-generic-container";

export type YdbDbRunnerContainerOptions = {
    grpcPort?: string;
    grpcTlsPort?: string;
} & DBRunnerContainerOptions;

export class YdbRunner{
    public static async getTestingEnvironment(){
        const containerName = 'cubejs-ydb-tests';
        const env = new DockerComposeEnvironment(__dirname, ["docker-compose.yaml"])
                                                    .withWaitStrategy(containerName, Wait.forHealthCheck());
        const startedEnv = await env.up([containerName]);
        const container = startedEnv.getContainer(containerName);
        return {
            container: container,
            composeEnvironment: startedEnv
        };
    }
}