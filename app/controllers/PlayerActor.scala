package controllers

import akka.actor.{Actor, ActorRef}
import akka.event.LoggingReceive
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import io.circe.{Decoder, Encoder}

class PlayerActor(client: ActorRef, game: ActorRef) extends Actor {

  def toJsonString(a: GameMessage)(implicit e: Encoder[GameMessage]) = a.asJson.noSpaces
  def fromJson(str: String)(implicit d: Decoder[GameMessage]) = decode[GameMessage](str).toOption

  game ! Join

  override def postStop() = {
    game ! Leave
    super.postStop()
  }

  override def receive: Receive = LoggingReceive {

    case input: String =>
      val msg: Option[GameMessage] = decode[GameMessage](input).toOption
      msg.fold { println(s"Unknown command '$input'") } { game ! _ }

    case msg: GameMessage =>
      val str: String = toJsonString(msg)
      client ! str
  }

}
