const { expect } = require('chai');
const { Server } = require('../Server');

class MockRoom {
    constructor() {
        this.id = 'fakeRoomId';
        this.players = new Map();
    }

    tryJoin() {
        return true;
    }

    has() {
        return true;
    }

    leave() {

    }
}

class MockClosedRoom {
    constructor() {
        this.id = 'closedRoomId';
    }

    tryJoin() {
        return false;
    }
}

describe('Server class tests', () => {
    const mockRoomInstance = new MockRoom();
    const config = { roomFactory: () => mockRoomInstance };
    const factory = (conf = config) => new Server(conf);

    describe('constructor', () => {
        it('should create a correct instance', () => {
            expect(factory).not.to.throw(Error);
            const server = factory();
            expect(server.rooms).to.be.a('Map').that.is.empty;
            expect(server.connections).to.be.a('Map').that.is.empty;
            expect(server.connectionRooms).to.be.a('Map').that.is.empty;
        });

        it('should report an error if created without the right parameters', () => {
            const factory = () => { new Server(); }
            expect(factory).to.throw(Error);
        });
    });

    describe('base events', () => {
        it('should save client on connection', () => {
            const clientId = 'someClient';
            const connection = { some: 'stuff' };
            const server = factory();

            server.connected(clientId, connection);

            expect(server.connections).to.include(connection);
        });

        it('should drop client on disconnection', () => {
            const clientId = 'someClient';
            const connection = { some: 'stuff' };
            const server = factory();
            server.connected(clientId, connection);

            expect(server.connections).to.include(connection);

            server.disconnected(clientId);
            expect(server.connections).not.to.include(connection);
        });
    });

    describe('client action events', () => {
        it('should create a room via the room factory', () => {
            const client = { id: 'someClientId' };
            const server = factory();
            server.createRoom(client, {});
            expect(server.rooms).to.include(mockRoomInstance);
            expect(server.rooms.get(mockRoomInstance.id)).to.be.equal(mockRoomInstance);
            expect(server.connectionRooms).to.include(mockRoomInstance.id);
            expect(server.connectionRooms.get(client.id)).to.be.equal(mockRoomInstance.id);
        });

        it('should let a client to join a previously created room', () => {
            const creator = { id: 'someClientId' };
            const joiner = { id: 'someJoinerId' };
            const { id: roomId } = mockRoomInstance;
            const server = factory();
            server.createRoom(creator, {});
            expect(server.rooms).to.include(mockRoomInstance);

            server.joinRoom(roomId, joiner);
            expect(server.connectionRooms.get(joiner.id)).to.be.equal(mockRoomInstance.id);
        });

        it('should not let a client join a non existing room', () => {
            const joiner = { id: 'someJoinerId', emit(type) { return type; } };
            const server = factory();
            const nonExistingRoomId = 'nonExistingRoomId';
            expect(server.rooms).to.be.a('Map').that.is.empty;
            expect(server.joinRoom(nonExistingRoomId, joiner)).to.be.false;
        });

        it('should not let a client join a room if the check fails at room level', () => {
            const closedRoomInstance = new MockClosedRoom();
            const config = { roomFactory: () => closedRoomInstance };
            const joiner = { id: 'someJoinerId', emit(type) { return type; } };
            const server = factory(config);
            const creator = { id: 'someClientId' };
            server.createRoom(creator, {});
            expect(server.rooms).to.include(closedRoomInstance);
            expect(server.joinRoom(closedRoomInstance.id, joiner)).to.be.false;
        });

        it('should let a client leave a room if that room has the client in', () => {
            const joiner = { id: 'someJoinerId', emit(type) { return type; } };
            const server = factory();
            const creator = { id: 'someClientId' };
            server.createRoom(creator, {});
            expect(server.rooms).to.include(mockRoomInstance);
            expect(server.joinRoom(mockRoomInstance.id, joiner)).to.be.true;
            expect(server.joinRoom(mockRoomInstance.id, joiner)).to.be.true;

            expect(server.leaveRoom(mockRoomInstance.id, joiner)).to.be.true;
        });

    });
})