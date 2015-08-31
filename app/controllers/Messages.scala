package controllers

sealed trait GameMessage

case object Join extends GameMessage
case object Leave extends GameMessage
final case class Update(position: Vector2, speed: Vector2) extends GameMessage

final case class PlayerJoined(player: Player) extends GameMessage
final case class PlayerLeft(playerId: PlayerId) extends GameMessage

final case class PlayerUpdated(player: Player) extends GameMessage
final case class PlayerList(players: Seq[Player]) extends GameMessage

final case class PlayerIdentity(id: PlayerId) extends GameMessage

final case class PlayerId(id: String)

final case class Color(r: Int, g: Int, b: Int)

final case class Vector2(x: Double, y: Double)

final case class Player(id: PlayerId, size: Double, color: Color, position: Vector2, speed: Vector2) {
  def update(position: Vector2, speed: Vector2) = Player(id, size, color, position, speed)
}

object Player {
  val rng = new scala.util.Random()

  def randomColor: Color = Color(rng.nextInt(200), rng.nextInt(200), rng.nextInt(200)) // to avoid too white colors

  def generate(id: PlayerId): Player = {
    Player(id,
      0.02,
      randomColor,
      Vector2(rng.nextDouble(), rng.nextDouble()),
      Vector2(0.2, 0)
    )
  }
}
