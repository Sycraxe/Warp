const {Events} = require('discord.js');
const AudioMixer = require('audio-mixer');
const prism = require('prism-media');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(o, n, db) {
        if (o.channel && o.channel != n.channel) {
            if (o.member == o.guild.members.me && (o.channel == db.lambda.channel || o.channel == db.kappa.channel)) {
                if (db.lambda.connection && db.kappa.connection) {

                    db.lambda.members.forEach((member, input) => {
                        db.lambda.mixer.removeInput(input)
                        db.lambda.members.delete(member)
                    })

                    db.kappa.members.forEach((member, input) => {
                        db.kappa.mixer.removeInput(input)
                        db.kappa.members.delete(member)
                    })

                    db.lambda.mixer = null
                    db.kappa.mixer = null
                    
                }
                if (o.channel == db.lambda.channel) {
                    db.lambda.channel = null
                    db.lambda.connection = null
                }
                if (o.channel == db.kappa.channel) {
                    db.kappa.channel = null
                    db.kappa.connection = null
                }
            }
            else {
                if (db.lambda.connection && db.kappa.connection) {
                    if (o.channel == db.lambda.channel) {
                        db.lambda.members.forEach((member, input) => {
                            if (member == o.member.id) {
                                db.lambda.mixer.removeInput(input)
                                db.lambda.members.delete(member)
                            }
                        })
                    }
                    if (o.channel == db.kappa.channel) {
                        db.kappa.members.forEach((member, input) => {
                            if (member == o.member.id) {
                                db.kappa.mixer.removeInput(input)
                                db.kappa.members.delete(member)
                            }
                        })
                    }
                }
            }
        }

        if (n.channel && n.channel != o.channel && db.lambda.connection && db.kappa.connection) {
            if (n.member == n.guild.members.me) {

                db.lambda.mixer = new AudioMixer.Mixer({channels: 2, sampleRate: 48000, bitDepth: 16});
                db.kappa.mixer = new AudioMixer.Mixer({channels: 2, sampleRate: 48000, bitDepth: 16});

                let options = {channels: 2, rate: 48000, frameSize: 960};

                db.lambda.channel.members.forEach(member => {
                    if (member !== n.guild.members.me) {
                        let input = db.lambda.mixer.input({channels: 2}) 
                        db.lambda.members.set(member.id, input)
                        db.lambda.connection.receiver.subscribe(member.id)
                            .pipe(new prism.opus.Decoder(options))
                            .pipe(input)
                    }
                });

                db.kappa.channel.members.forEach(member => {
                    if (member !== n.guild.members.me) {
                        let input = db.kappa.mixer.input({channels: 2}) 
                        db.kappa.members.set(member.id, input)
                        db.kappa.connection.receiver.subscribe(member.id)
                            .pipe(new prism.opus.Decoder(options))
                            .pipe(input)
                    }
                });

                db.lambda.mixer.pipe(new prism.opus.Encoder(options)).on("data", chunk => db.kappa.connection.playOpusPacket(chunk));
                db.kappa.mixer.pipe(new prism.opus.Encoder(options)).on("data", chunk => db.lambda.connection.playOpusPacket(chunk));

            }
            else {

                let options = {channels: 2, rate: 48000, frameSize: 960};

                if (n.channel == db.lambda.channel) {
                    let input = db.lambda.mixer.input({channels: 2}) 
                    db.lambda.members.set(n.member.id, input)
                    db.lambda.connection.receiver.subscribe(n.member.id)
                        .pipe(new prism.opus.Decoder(options))
                        .pipe(input)
                }
                if (n.channel == db.kappa.channel) {
                    let input = db.kappa.mixer.input({channels: 2}) 
                    db.kappa.members.set(n.member.id, input)
                    db.kappa.connection.receiver.subscribe(n.member.id)
                        .pipe(new prism.opus.Decoder(options))
                        .pipe(input)
                }
            }
            
        }

        console.log(o.channelId, "=>", n.channelId)
    }
}