package controllers

import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import io.circe.{Decoder, Encoder}


object Serializer extends App {

  def toJsonString(a: GameMessage)(implicit e: Encoder[GameMessage]) = a.asJson.noSpaces
  def fromJson(str: String)(implicit d: Decoder[GameMessage]) = decode[GameMessage](str).toOption

  val foo: GameMessage = PlayerUpdated(Player(PlayerId("123"), 50, 50, 10))

  val str: String = toJsonString(foo)
  println(str)

  val msg = fromJson(str)
  println(msg)
}

