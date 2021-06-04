import {AppDocument} from "./AppDocument";
import {db} from "./lib/db";

export const defaults: db.NodeSnapshot<AppDocument> = {
    children: [{
        document: "A car",
        children: [{
            document: "Chassis",
            children: [{
                document: "Body",
            }, {
                document: "Doors",
                children: [{
                    document: "Front left",
                }, {
                    document: "Front right",
                }, {
                    document: "Rear left",
                }, {
                    document: "Rear right",
                }],
            }],
        }, {
            document: "Engine",
            children: [{
                document: "Cylinder head cover",
            }, {
                document: "Cylinder head",
                children: [{
                    document: "Intake crankshaft",
                }, {
                    document: "Exhaust crankshaft",
                }, {
                    document: "Valves",
                }],
            }, {
                document: "Intake manifold",
            }, {
                document: "Exhaust manifold",
            }, {
                document: "Engine block",
            }, {
                document: "Oil pan"
            }],
        }, {
            document: "Transmission"
        }],
    }],
};
