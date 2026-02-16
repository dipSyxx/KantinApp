import { useMenuItem } from '@/api/hooks/useMenuItem'
import { useVote } from '@/api/hooks/useVote'
import { AllergenBadge, StatusBadge } from '@/components/Badge'
import { ErrorState } from '@/components/ErrorState'
import { VoteButtons } from '@/components/VoteButtons'
import { VoteStats } from '@/components/VoteStats'
import { useAuth } from '@/context/AuthContext'
import { formatDayName, formatShortDate } from '@/lib/week'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { Alert, ScrollView, Text, View } from 'react-native'

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { data, isLoading, isError, refetch } = useMenuItem(id)
  const voteMutation = useVote()

  const handleVote = (value: number) => {
    if (!isAuthenticated) {
      Alert.alert('Logg inn', 'Du må logge inn for å stemme.', [{ text: 'OK' }])
      return
    }

    if (!data) return
    if (!data.canVote) {
      Alert.alert(
        'Stemmegivning er stengt',
        data.voteLockedReason ?? 'Du kan bare stemme pa dagens retter.',
        [{ text: 'OK' }]
      )
      return
    }

    voteMutation.mutate({
      menuItemId: id,
      value,
      isUpdate: data.myVote !== null,
    })
  }

  if (isLoading) {
    return (
      <View className='flex-1 bg-white items-center justify-center'>
        <Text className='text-gray-400'>Laster...</Text>
      </View>
    )
  }

  if (isError || !data) {
    return <ErrorState message='Kunne ikke laste rettdetaljer.' onRetry={refetch} />
  }

  const { dish, stats, myVote, price, day, status, canVote, voteLockedReason } = data
  const dayName = formatDayName(day.date)
  const shortDate = formatShortDate(day.date)
  const voteDisabled = voteMutation.isPending || !canVote

  return (
    <ScrollView className='flex-1 bg-white'>
      {/* Hero image */}
      <View>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={{ width: '100%', height: 256 }}
            contentFit='cover'
            transition={300}
          />
        ) : (
          <View style={{ width: '100%', height: 256 }} className='bg-gray-200 items-center justify-center'>
            <Ionicons name='image-outline' size={64} color='#9CA3AF' />
          </View>
        )}
      </View>

      <View className='px-5 pt-5 pb-10'>
        {/* Title and price */}
        <View className='flex-row items-start justify-between mb-2'>
          <Text className='text-2xl font-bold text-gray-900 flex-1 mr-4'>
            {dish.title} kr {price},-
          </Text>
          <StatusBadge status={status as 'ACTIVE' | 'CHANGED' | 'SOLD_OUT'} />
        </View>

        {/* Day info */}
        <Text className='text-sm text-gray-500 mb-3'>
          {dayName} {shortDate}
        </Text>

        {/* Description */}
        {dish.description && <Text className='text-base text-gray-600 leading-6 mb-4'>{dish.description}</Text>}

        {/* Price tag */}
        <Text className='text-lg font-bold text-brand-green mb-4'>Pris: {price} kr</Text>

        {/* Allergens */}
        {dish.allergens.length > 0 && (
          <View className='mb-4'>
            <Text className='text-sm font-semibold text-gray-700 mb-2'>Allergener</Text>
            <View className='flex-row flex-wrap'>
              {dish.allergens.map((allergen) => (
                <AllergenBadge key={allergen} allergen={allergen} />
              ))}
            </View>
          </View>
        )}

        {/* Voting section */}
        <View className='bg-gray-50 rounded-2xl p-5 mt-2'>
          <Text className='text-xl font-bold text-gray-900 text-center mb-1'>Stem på denne retten!</Text>

          {myVote !== null && (
            <Text className='text-sm text-gray-500 text-center mb-3'>
              Du stemte {myVote === 1 ? '😀' : myVote === 0 ? '😐' : '😞'}
              {' · Trykk for å endre'}
            </Text>
          )}

          {!canVote && (
            <Text className='text-sm text-gray-500 text-center mb-3'>
              {voteLockedReason ?? 'Du kan bare stemme pa dagens retter.'}
            </Text>
          )}

          <VoteButtons currentVote={myVote} onVote={handleVote} disabled={voteDisabled} />

          {/* Stats */}
          {stats.total > 0 && (
            <View className='mt-6'>
              <Text className='text-sm font-medium text-gray-500 mb-2'>
                {stats.total} {stats.total === 1 ? 'stemme' : 'stemmer'} totalt
              </Text>
              <VoteStats stats={stats} />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
