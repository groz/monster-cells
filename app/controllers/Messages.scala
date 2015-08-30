package controllers

sealed trait GameMessage

case object Join extends GameMessage
case object Leave extends GameMessage
final case class Move(x: Int, y: Int) extends GameMessage

final case class PlayerJoined(player: Player) extends GameMessage
final case class PlayerLeft(playerId: PlayerId) extends GameMessage

final case class PlayerUpdated(player: Player) extends GameMessage
final case class PlayerList(players: Seq[Player]) extends GameMessage

final case class PlayerId(id: String)

final case class Player(id: PlayerId, x: Int, y: Int, size: Int) {
  def move(x: Int, y: Int) = Player(id, x, y, size)
}