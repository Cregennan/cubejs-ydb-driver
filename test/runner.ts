import {
    DbRunnerAbstract,
    DBRunnerContainerOptions
} from "@cubejs-backend/testing-shared/dist/src/db-container-runners/db-runner.abstract";
import {GenericContainer} from "testcontainers";
import {StartedGenericContainer} from "testcontainers/build/generic-container/started-generic-container";

export type YdbDbRunnerContainerOptions = {
    grpcPort?: string;
    grpcTlsPort?: string;
} & DBRunnerContainerOptions;

export class YdbDbRunner extends DbRunnerAbstract {
    public static startContainer(options: YdbDbRunnerContainerOptions){
        const version = process.env.TEST_YDB_VERSION || options.version || 'latest';

        const container = new GenericContainer(`ydbplatform/local-ydb:${version}`)
            .withEnvironment({
                GRPC_TLS_PORT: process.env.TEST_YDB_GRPC_TLS_PORT || options.grpcTlsPort || '2135',
                GRPC_PORT: process.env.TEST_YDB_GRPC_PORT || options.grpcPort || '2136',
            });

        return container.start();
    }
}