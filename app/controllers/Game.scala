package controllers

import akka.actor.{Actor, ActorRef}
import akka.event.LoggingReceive

class Game extends Actor {

  override def receive: Receive = process(Map.empty)

  def process(players: Map[ActorRef, Player]): Receive = LoggingReceive {

    case Join =>
      val id = PlayerId(sender.path.toString)
      val player = Player(id, 50, 50, 10)
      val newPlayers = players + (sender -> player)
      context become process(newPlayers)
      sender ! PlayerList(newPlayers.values.toSeq)
      players.keySet.foreach (_ ! PlayerJoined(player))

    case Leave =>
      val player = players(sender)
      context become process(players - sender)
      players.keySet.foreach(_ ! PlayerLeft(player.id))

    case Move(x, y) =>
      val player = players(sender).move(x, y)
      context become process(players.updated(sender, player))
      players.keySet.foreach(_ ! PlayerUpdated(player))
  }

}
