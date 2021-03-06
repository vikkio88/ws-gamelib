import React, { Component } from 'react';
import { playSounds } from 'libs';
import { Button, Input, Icon } from 'components/common';
import { Bullet, Actions, Score } from 'components/game';

let playedSound = false;

class Game extends Component {
    winnerLoser(finishedAndWinner) {
        if (finishedAndWinner) {
            return 'YOU WON';
        }

        return 'YOU LOST';
    }

    render() {
        const { gameState = {}, roomId, playerId, onAction, onLeave } = this.props;
        const { waiting, finished, resolved, actions, history } = gameState;
        const { loaded } = (gameState && gameState.players) ? gameState.players[playerId] : {};
        const finishedAndWinner = finished && gameState.players[playerId].winner;
        const restartRequested = finished && gameState.players[playerId].restartRequest;

        const myTurn = playerId && (playerId === (gameState && gameState.turn));

        if (finished && !playedSound) {
            playSounds(['shoot', 'dead']);
            playedSound = true;
        }

        if (!finished && playedSound) {
            playedSound = false;
        }

        return (
            <div className="view">

                <div className="actions">
                    {finished && (
                        <>
                            <h1>{this.winnerLoser(finishedAndWinner)}</h1>
                            <Score me={playerId} history={history} />
                            {!restartRequested && (
                                <>
                                    <h2>Do you want to play another game?</h2>
                                    <div>
                                        <Button small onClick={() => onAction('restart')}>Yes</Button>
                                        <Button small onClick={() => { onLeave(roomId) }}>No</Button>
                                    </div>
                                </>)}
                            {restartRequested && (
                                <>
                                    <h2>Waiting for the other player to accept</h2>
                                    <Button onClick={() => onLeave(roomId)}>Leave Room</Button>
                                </>
                            )}
                        </>
                    )}
                    {!finished && (
                        <>
                            <div>
                                {waiting && <h3>Room: <Input disabled value={roomId} /></h3>}
                                {waiting && <h2>Waiting for Player 2</h2>}
                                {!waiting && (
                                    <div className="status">
                                        <Bullet loaded={loaded} />
                                        <h3>{`${myTurn ? 'Your' : 'Enemy'} turn`}</h3>
                                    </div>
                                )}
                                <Button icon disabled={!myTurn || !loaded} onClick={() => onAction('shoot')}>
                                    <Icon type="shoot" />
                                </Button>
                                <Button icon disabled={!myTurn} onClick={() => onAction('defend')}>
                                    <Icon type="defend" />
                                </Button>
                                <Button icon disabled={!myTurn} onClick={() => onAction('reload')}>
                                    <Icon type="reload" />
                                </Button>
                            </div>
                            <div>
                                {resolved && (
                                    <Actions
                                        playSound={[0, 2].includes(Object.keys(actions).length)}
                                        actions={resolved}
                                        playerId={playerId}
                                    />
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        );
    }
}

export default Game;