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

final case class Color(r: Int, g: Int, b: Int)

final case class Player(id: PlayerId, x: Int, y: Int, size: Int, color: Color) {
  def move(x: Int, y: Int) = Player(id, x, y, size, color)
}

object Player {
  val rng = new scala.util.Random()

  def randomColor: Color = Color(rng.nextInt(200), rng.nextInt(200), rng.nextInt(200)) // to avoid too white colors

  def generate(id: PlayerId): Player = {
    Player(id,
      rng.nextInt(200),
      rng.nextInt(200),
      10,
      randomColor
    )
  }
}