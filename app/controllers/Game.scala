package controllers

import akka.actor.{Actor, ActorRef}
import akka.event.LoggingReceive

class Game extends Actor {

  override def receive: Receive = process(Map.empty)

  def process(players: Map[ActorRef, Player]): Receive = LoggingReceive {

    case Join =>
      val id = PlayerId(sender.path.toString)
      val player = Player.generate(id)
      val newPlayers = players + (sender -> player)
      context become process(newPlayers)

      sender ! PlayerIdentity(id)
      sender ! PlayerList(newPlayers.values.toSeq)

      players.keySet.foreach (_ ! PlayerJoined(player))

    case Leave =>
      val player = players(sender)
      context become process(players - sender)
      players.keySet.foreach(_ ! PlayerLeft(player.id))

    case Update(position, speed) =>
      val player = players(sender).update(position, speed)
      context become process(players.updated(sender, player))
      (players.keySet - sender).foreach(_ ! PlayerUpdated(player))
  }

}
