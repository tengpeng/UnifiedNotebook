import React from "react";
import { DataExplorer } from "@nteract/data-explorer";

export interface Field {
    name: string;
    type: string;
}

export interface Schema {
    fields: Field[];
    pandas_version?: string;
    primaryKey?: string[];
}
export interface Datapoint {
    [fieldName: string]: any;
}

export interface DataProps {
    schema: Schema;
    data: Datapoint[];
}

type Props = {
    data: DataProps;
    mediaType: "application/vnd.dataresource+json";
};

export default class DataSource extends React.PureComponent<Props> {
    static MIMETYPE = "application/vnd.dataresource+json";

    static defaultProps = {
        data: { data: [], schema: {} },
        mediaType: "application/vnd.dataresource+json"
    };

    render() {
        return (
            <DataExplorer data={this.props.data}></DataExplorer>
        )
    }
}

