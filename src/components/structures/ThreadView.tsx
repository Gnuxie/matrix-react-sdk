/*
Copyright 2016 OpenMarket Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src';

import BaseCard from "../views/right_panel/BaseCard";
import { RightPanelPhases } from "../../stores/RightPanelStorePhases";
import { replaceableComponent } from "../../utils/replaceableComponent";
import { MatrixClientPeg } from '../../MatrixClientPeg';

import ResizeNotifier from '../../utils/ResizeNotifier';
import EventTile from '../views/rooms/EventTile';
import MessageComposer from '../views/rooms/MessageComposer';
import { RoomPermalinkCreator } from '../../utils/permalinks/Permalinks';

interface IProps {
    roomId: string;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
    mxEvent: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
}

interface IState {
}

/*
 * Component which shows the filtered file using a TimelinePanel
 */
@replaceableComponent("structures.ThreadView")
class ThreadView extends React.Component<IProps, IState> {
    state = {};

    public componentDidMount(): void {
        // this.props.mxEvent.getThread().on("Thread.update", this.updateThread);
        this.props.mxEvent.getThread().once("Thread.ready", this.updateThread);
    }

    public componentWillUnmount(): void {
        this.props.mxEvent.getThread().removeListener("Thread.update", this.updateThread);
    }

    updateThread = () => {
        this.forceUpdate();
    };

    public renderEventTile(event: MatrixEvent): JSX.Element {
        return <EventTile
            key={event.getId()}
            mxEvent={event}
            enableFlair={false}
            showReadReceipts={false}
            as="div"
        />;
    }

    public render() {
        const thread = this.props.mxEvent.getThread();
        const room = MatrixClientPeg.get().getRoom(this.props.roomId);
        return (
            <BaseCard
                className="mx_ThreadView"
                onClose={this.props.onClose}
                previousPhase={RightPanelPhases.RoomSummary}
            >
                { this.renderEventTile(this.props.mxEvent) }

                { thread && (
                    thread.eventTimeline.map((event: MatrixEvent) => {
                        return this.renderEventTile(event);
                    })
                ) }

                <MessageComposer
                    room={room}
                    resizeNotifier={this.props.resizeNotifier}
                    replyToEvent={this.props.mxEvent}
                    permalinkCreator={this.props.permalinkCreator}
                />
            </BaseCard>
        );
    }
}

export default ThreadView;
