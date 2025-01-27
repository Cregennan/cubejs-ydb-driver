import {
    DBRunnerContainerOptions
} from "@cubejs-backend/testing-shared/dist/src/db-container-runners/db-runner.abstract";
import {
    DockerComposeEnvironment,
    Wait,
} from "testcontainers";

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